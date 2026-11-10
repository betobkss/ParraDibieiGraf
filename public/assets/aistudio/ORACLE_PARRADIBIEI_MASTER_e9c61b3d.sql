cat > /tmp/oracle_profile_master.sh <<'SCRIPT'
#!/bin/bash
# ParraDibiei ORACLE_PROFILE_MASTER v3.0
# Coleta inicial universal READ-ONLY para incidentes Oracle, RAC, Exadata e CDB/PDB.
# Uso: ./oracle_profile_master.sh INC012345678

set -u
set -o pipefail
umask 077

INCIDENTE="${1:-SEM_INCIDENTE}"
TOP_N="${TOP_N:-10}"
VERSION="3.2-RC1.1"
OUT_DIR="${OUT_DIR:-$HOME}"
STAMP="$(date +%Y%m%d_%H%M%S)"
HOST_SHORT="$(hostname -s 2>/dev/null || hostname)"
OUT="$OUT_DIR/parradibiei_${INCIDENTE}_${HOST_SHORT}_${STAMP}.txt"
AWR_FILE=""
D="$(printf '\044')"

say(){ printf '%s\n' "$*"; }
warn(){ say "[AVISO] $*"; }
fail(){ say "[ERRO] $*"; exit "${2:-1}"; }
ask12(){
  local prompt="$1" answer
  while true; do
    read -r -p "$prompt" answer
    answer="${answer:-2}"
    case "$answer" in 1|2) printf '%s' "$answer"; return 0;; *) say "Selecione 1, 2 ou Enter para Nao." >&2;; esac
  done
}

say "======================================================================"
say " PARRADIBIEI | ORACLE_PROFILE_MASTER"
say " VERSAO: $VERSION | INCIDENTE: $INCIDENTE"
say " HOST: $(hostname -f 2>/dev/null || hostname)"
say " DATA: $(date '+%d/%m/%Y %H:%M:%S')"
say " CLASSIFICACAO: READ-ONLY | RANKINGS: TOP $TOP_N"
say "======================================================================"

mapfile -t INSTANCIAS < <(ps -eo args= | awk '$1 ~ /^ora_pmon_/ {sid=$1; sub(/^ora_pmon_/,"",sid); if (sid!="" && sid !~ /^\+/) print sid}' | sort -u)
[ "${#INSTANCIAS[@]}" -gt 0 ] || fail "Nenhuma instancia Oracle de banco localizada pelo PMON."

say ""
say "Instancias Oracle encontradas:"
for i in "${!INSTANCIAS[@]}"; do printf '  [%d] %s\n' "$((i+1))" "${INSTANCIAS[$i]}"; done
read -r -p "Selecione a instancia [1-${#INSTANCIAS[@]}]: " OPCAO
[[ "$OPCAO" =~ ^[0-9]+$ ]] || fail "Selecao nao numerica."
[ "$OPCAO" -ge 1 ] && [ "$OPCAO" -le "${#INSTANCIAS[@]}" ] || fail "Opcao fora do intervalo."
ORACLE_SID="${INSTANCIAS[$((OPCAO-1))]}"
ORACLE_HOME=""

if [ -r /etc/oratab ]; then ORACLE_HOME="$(awk -F: -v sid="$ORACLE_SID" '$1==sid && $2!="" {print $2; exit}' /etc/oratab)"; fi
if [ -z "$ORACLE_HOME" ] || [ ! -x "$ORACLE_HOME/bin/sqlplus" ]; then
  PMON_PID="$(ps -eo pid=,args= | awk -v t="ora_pmon_$ORACLE_SID" '$2==t {print $1; exit}')"
  if [ -n "${PMON_PID:-}" ] && [ -r "/proc/$PMON_PID/environ" ]; then
    ORACLE_HOME="$(tr '\0' '\n' < "/proc/$PMON_PID/environ" 2>/dev/null | awk -F= '$1=="ORACLE_HOME" {print substr($0,index($0,"=")+1); exit}')"
  fi
fi
if [ -z "$ORACLE_HOME" ] || [ ! -x "$ORACLE_HOME/bin/sqlplus" ]; then ORACLE_HOME="$(find /u01 /u02 /opt /produtos/oracle -type f -path '*/dbhome*/bin/sqlplus' 2>/dev/null | head -1 | sed 's#/bin/sqlplus$##')"; fi
[ -n "$ORACLE_HOME" ] && [ -x "$ORACLE_HOME/bin/sqlplus" ] || fail "Database ORACLE_HOME nao localizado para $ORACLE_SID."
case "$ORACLE_HOME" in *grid*|*gridhome*) fail "Grid Home recusado: $ORACLE_HOME";; esac
export ORACLE_SID ORACLE_HOME PATH="$ORACLE_HOME/bin:$PATH"

say "Ambiente: SID=$ORACLE_SID | HOME=$ORACLE_HOME | SQLPLUS=$(command -v sqlplus)"

PACK_OK="2"
AWR_OPT="2"
ASH_HIST_OPT="2"
if [ -t 0 ]; then
  PACK_OK="$(ask12 'A licenca Oracle Diagnostics Pack esta confirmada? [1] Sim [2] Nao [Enter=2]: ')"
  if [ "$PACK_OK" = "1" ]; then
    AWR_OPT="$(ask12 'Deseja gerar AWR Global HTML? [1] Sim [2] Nao [Enter=2]: ')"
    ASH_HIST_OPT="$(ask12 'Deseja coletar ASH historico? [1] Sim [2] Nao [Enter=2]: ')"
  else
    warn "PACK-GATING: ASH atual, ASH historico e AWR desabilitados."
  fi
fi

INI=""; FIM=""
if [ "$AWR_OPT" = "1" ] || [ "$ASH_HIST_OPT" = "1" ]; then
  DEF_FIM="$(date '+%Y-%m-%d %H:%M')"
  DEF_INI="$(date -d '2 hours ago' '+%Y-%m-%d %H:%M' 2>/dev/null || date '+%Y-%m-%d %H:%M')"
  read -r -p "Inicio [$DEF_INI]: " INI; INI="${INI:-$DEF_INI}"
  read -r -p "Fim    [$DEF_FIM]: " FIM; FIM="${FIM:-$DEF_FIM}"
  for t in "$INI" "$FIM"; do [[ "$t" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}\ [0-9]{2}:[0-9]{2}$ ]] || fail "Horario invalido: $t"; date -d "$t" >/dev/null 2>&1 || fail "Data invalida: $t"; done
  [[ "$INI" < "$FIM" ]] || fail "Inicio deve ser menor que fim."
fi

exec > >(tee "$OUT") 2>&1

say "===== S00 CONTEXTO SO ====="
say "HOST=$(hostname -f 2>/dev/null || hostname) SID=$ORACLE_SID HOME=$ORACLE_HOME"
uname -r; uptime; getconf _NPROCESSORS_ONLN 2>/dev/null || nproc; free -g 2>/dev/null || free -m
say "TOP 10 FILESYSTEMS POR OCUPACAO"
df -hP 2>/dev/null | awk 'NR==1{print;next}{p=$5;gsub(/%/,"",p);print p"|"$0}' | sort -t'|' -k1,1nr | head -n "$TOP_N" | cut -d'|' -f2-

say "===== S01 TOPOLOGIA E SAUDE ORACLE ====="
sqlplus -s / as sysdba <<SQL
set lines 300 pages 200 feedback off verify off heading on trimspool on tab off
whenever sqlerror continue
col instancia for a14
col host for a24
col banco for a14
col db_unique_name for a20
col role for a18
col open_mode for a18
col pdb for a24
col parametro for a30
col valor for a26
col event for a42
col wait_class for a16
col sql_id for a13
col module for a30
col program for a34
col diskgroup for a18
prompt -- IDENTIDADE LOCAL
select sys_context('USERENV','INSTANCE_NAME') instancia,sys_context('USERENV','SERVER_HOST') host,sys_context('USERENV','DB_NAME') banco,to_char(sysdate,'DD/MM/YYYY HH24:MI:SS') coleta from dual;
prompt -- RAC
select inst_id,instance_name instancia,host_name host,status,thread#,version from gv${D}instance order by inst_id;
prompt -- BANCO
select name banco,db_unique_name,database_role role,open_mode,protection_mode,switchover_status,cdb from v${D}database;
prompt -- PDBS
select * from (select con_id,name pdb,open_mode,restricted from v${D}pdbs order by con_id) where rownum <= $TOP_N;
prompt -- PARAMETROS ESSENCIAIS
select inst_id,name parametro,value valor from gv${D}parameter where name in ('cluster_database','cluster_database_instances','cpu_count','processes','sessions','sga_target','pga_aggregate_target','parallel_degree_policy','parallel_max_servers','resource_manager_plan') order by inst_id,name;
prompt -- TOP 10 SESSOES ATIVAS
select * from (select inst_id,sid,serial#,username,sql_id,event,wait_class,module,program,round(last_call_et/60,2) minutos from gv${D}session where type='USER' and status='ACTIVE' order by last_call_et desc) where rownum <= $TOP_N;
prompt -- TOP 10 BLOQUEIOS
select * from (select inst_id,sid,serial#,username,sql_id,blocking_instance,blocking_session,final_blocking_instance,final_blocking_session,event,seconds_in_wait from gv${D}session where blocking_session is not null or final_blocking_session is not null order by seconds_in_wait desc) where rownum <= $TOP_N;
prompt -- TOP 10 WAITS NAO IDLE ACUMULADOS DESDE O STARTUP
select * from (select inst_id,event,wait_class,total_waits,round(time_waited_micro/1000000,2) segundos from gv${D}system_event where wait_class <> 'Idle' order by time_waited_micro desc) where rownum <= $TOP_N;
prompt -- TOP 10 ASM DISKGROUPS
select * from (select inst_id,name diskgroup,state,type redundancy,round(total_mb/1024,2) total_gb,round(free_mb/1024,2) free_gb,round((total_mb-free_mb)*100/nullif(total_mb,0),2) used_pct from gv${D}asm_diskgroup order by used_pct desc) where rownum <= $TOP_N;
prompt -- TOP 10 DESTINOS DG
select * from (select inst_id,dest_id,status,destination,error from gv${D}archive_dest_status where status <> 'INACTIVE' order by inst_id,dest_id) where rownum <= $TOP_N;
exit;
SQL

say "===== S02 CPU HOST | 5 AMOSTRAS ====="
if command -v mpstat >/dev/null 2>&1; then mpstat 1 5; else top -b -n 2 -d 2 | head -40; fi

say "===== S03 TOP 10 PROCESSOS CPU DA INSTANCIA ====="
PROCESS_PATTERN="oracle${ORACLE_SID}"
mapfile -t TOP_ROWS < <(ps -eo pid=,ppid=,user=,pcpu=,pmem=,etime=,args= --sort=-pcpu | awk -v p="$PROCESS_PATTERN" 'index($7,p)==1{print}' | head -n "$TOP_N")
printf '%s\n' "${TOP_ROWS[@]:-SEM_PROCESSOS_ENCONTRADOS}"
PID_LIST="$(printf '%s\n' "${TOP_ROWS[@]:-}" | awk '{print $1}' | grep -E '^[0-9]+$' | sort -u | paste -sd, -)"

if [ -n "$PID_LIST" ]; then
say "===== S04 CORRELACAO PID SESSAO SQL ====="
sqlplus -s / as sysdba <<SQL
set lines 340 pages 200 feedback off verify off heading on trimspool on tab off
whenever sqlerror continue
col pid for a10
col username for a18
col pdb for a22
col service_name for a24
col sql_id for a13
col event for a38
col wait_class for a16
col program for a34
col module for a30
col sql_text for a90
select * from (select p.spid pid,s.inst_id,s.sid,s.serial#,s.username,nvl(c.name,'CDB_ROOT') pdb,s.service_name,s.sql_id,s.status,s.event,s.wait_class,round(s.last_call_et/60,2) minutos,s.program,s.module from gv${D}process p left join gv${D}session s on s.inst_id=p.inst_id and s.paddr=p.addr left join v${D}containers c on c.con_id=s.con_id where p.inst_id=sys_context('USERENV','INSTANCE') and regexp_like(p.spid,'^[0-9]+$') and to_number(p.spid) in ($PID_LIST) order by minutos desc nulls last) where rownum <= $TOP_N;

prompt -- TOP 10 SQLS IDENTIFICADOS COM METRICAS
select * from (
  select q.inst_id,q.sql_id,q.plan_hash_value,q.executions,
         round(q.cpu_time/1000000/greatest(q.executions,1),3) cpu_por_exec,
         round(q.elapsed_time/1000000/greatest(q.executions,1),3) elapsed_por_exec,
         round(q.buffer_gets/greatest(q.executions,1)) gets_por_exec,
         substr(replace(replace(q.sql_text,chr(10),' '),chr(13),' '),1,200) sql_text
  from gv${D}sqlstats q
  where (q.inst_id,q.sql_id) in (
    select distinct s.inst_id,s.sql_id from gv${D}process p join gv${D}session s
      on s.inst_id=p.inst_id and s.paddr=p.addr
    where p.inst_id=sys_context('USERENV','INSTANCE')
      and regexp_like(p.spid,'^[0-9]+$') and to_number(p.spid) in ($PID_LIST)
      and s.sql_id is not null)
  order by q.cpu_time desc
) where rownum <= $TOP_N;
exit;
SQL
fi

say "===== S05 ASH ATUAL | TOP 10 | PACK-GATING CONSERVADOR ====="
if [ "$PACK_OK" = "1" ]; then
sqlplus -s / as sysdba <<SQL
set lines 280 pages 100 feedback off heading on
whenever sqlerror continue
col evento for a42
col classe for a16
col sql_id for a13
select * from (select nvl(event,'ON CPU') evento,nvl(wait_class,'CPU') classe,count(*) amostras,count(distinct session_id||':'||session_serial#) sessoes from gv${D}active_session_history where sample_time > systimestamp - interval '10' minute group by event,wait_class order by amostras desc) where rownum <= $TOP_N;
select * from (select sql_id,count(*) amostras,max(module) module,max(program) program from gv${D}active_session_history where sample_time > systimestamp - interval '10' minute and sql_id is not null group by sql_id order by amostras desc) where rownum <= $TOP_N;
exit;
SQL
else
say "PACK-GATING: ASH atual nao executado sem confirmacao de Diagnostics Pack."
fi

say "===== S06 PERFIL RMAN AUTOMATICO ====="
RMAN_ACTIVE="$(sqlplus -s / as sysdba <<SQL
set heading off feedback off pages 0
select case when exists (select 1 from gv${D}session where lower(program) like '%rman%' or lower(module) like '%backup%' or event like 'Backup:%') or exists (select 1 from v${D}rman_backup_job_details where status like 'RUNNING%') then 'YES' else 'NO' end from dual;
exit;
SQL
)"
if printf '%s\n' "${TOP_ROWS[@]:-}" | grep -qi 'rman' || echo "$RMAN_ACTIVE" | grep -q YES; then
sqlplus -s / as sysdba <<SQL
set lines 220 pages 100 feedback off heading on
whenever sqlerror continue
col input_type for a20
col status for a24
col inicio for a19
col fim for a19
select * from (select input_type,status,to_char(start_time,'DD/MM/YYYY HH24:MI:SS') inicio,to_char(end_time,'DD/MM/YYYY HH24:MI:SS') fim,input_bytes_display entrada,output_bytes_display saida,time_taken_display duracao from v${D}rman_backup_job_details where start_time > sysdate-1 order by start_time desc) where rownum <= $TOP_N;
select * from (select inst_id,sid,serial#,opname,sofar,totalwork,round(sofar*100/nullif(totalwork,0),2) pct,round(time_remaining/60,2) restante_min from gv${D}session_longops where opname like 'RMAN%' and totalwork>0 and sofar<totalwork order by start_time) where rownum <= $TOP_N;
exit;
SQL
else
say "RMAN nao detectado entre os TOP $TOP_N processos."
fi

if [ "$ASH_HIST_OPT" = "1" ] && [ "$PACK_OK" = "1" ]; then
say "===== S07 ASH HISTORICO | TOP 10 ====="
sqlplus -s / as sysdba <<SQL
set lines 280 pages 100 feedback off heading on
whenever sqlerror continue
col evento for a42
select * from (select nvl(event,'ON CPU') evento,nvl(wait_class,'CPU') classe,count(*)*10 segundos,count(distinct instance_number) instancias,count(distinct session_id||':'||instance_number) sessoes from dba_hist_active_sess_history where sample_time between to_date('$INI','YYYY-MM-DD HH24:MI') and to_date('$FIM','YYYY-MM-DD HH24:MI') group by event,wait_class order by segundos desc) where rownum <= $TOP_N;
exit;
SQL
else
say "ASH historico nao solicitado ou bloqueado pelo Pack-Gating."
fi

if [ "$AWR_OPT" = "1" ] && [ "$PACK_OK" = "1" ]; then
say "===== S08 AWR GLOBAL HTML ====="
read BID EID < <(sqlplus -s / as sysdba <<SQL
set heading off feedback off pages 0
select min(case when end_interval_time >= to_date('$INI','YYYY-MM-DD HH24:MI') then snap_id end)||' '||nvl(min(case when end_interval_time >= to_date('$FIM','YYYY-MM-DD HH24:MI') then snap_id end),max(snap_id)) from dba_hist_snapshot where dbid=(select dbid from v${D}database);
exit;
SQL
)
if [ -n "${BID:-}" ] && [ -n "${EID:-}" ] && [ "$BID" -lt "$EID" ] 2>/dev/null; then
  AWR_FILE="$OUT_DIR/parradibiei_${INCIDENTE}_awr_global_${BID}_${EID}.html"
  sqlplus -s / as sysdba >/dev/null <<SQL
set heading off feedback off pages 0 lines 8000 trimspool on verify off echo off long 1000000
col dbid new_value DBID noprint
select dbid from v${D}database;
spool $AWR_FILE
select output from table(dbms_workload_repository.awr_global_report_html(&DBID,'',$BID,$EID));
spool off
exit;
SQL
  say "AWR GERADO: $AWR_FILE"
else warn "Snapshots AWR nao encontrados para a janela."; fi
else
say "AWR Global nao solicitado ou bloqueado pelo Pack-Gating."
fi

say "===== CLASSIFICACAO AUTOMATICA ====="

# Retorna somente o ultimo valor numerico de uma consulta escalar SQL*Plus.
sql_scalar_number()
{
  sqlplus -s / as sysdba 2>/dev/null | awk '''/^[[:space:]]*[0-9]+([.][0-9]+)?[[:space:]]*$/ {gsub(/[[:space:]]/,"",$0); value=$0} END {if(value=="") value=0; print value}'''
}

status_used_pct()
{
  awk -v x="$1" '''BEGIN {if(x>=95) print "EMERGENCIA"; else if(x>=90) print "CRITICO"; else if(x>=80) print "ATENCAO"; else print "SAUDAVEL"}'''
}

status_idle_pct()
{
  awk -v x="$1" '''BEGIN {if(x<5) print "EMERGENCIA"; else if(x<10) print "CRITICO"; else if(x<20) print "ATENCAO"; else print "SAUDAVEL"}'''
}

severity_rank()
{
  case "$1" in
    EMERGENCIA|BLOQUEIOS_ATIVOS) echo 4 ;;
    CRITICO) echo 3 ;;
    ATENCAO) echo 2 ;;
    SAUDAVEL|SEM_BLOQUEIOS|SEM_RMAN_ATIVO) echo 1 ;;
    *) echo 0 ;;
  esac
}

CPU_IDLE="$(mpstat 1 1 2>/dev/null | awk '''/Average:.*all/ {value=$NF} END {print value}''')"
if [[ "$CPU_IDLE" =~ ^[0-9]+([.][0-9]+)?$ ]]; then
  CPU_STATUS="$(status_idle_pct "$CPU_IDLE")"
else
  CPU_IDLE="N/A"
  CPU_STATUS="NAO_AVALIADO"
fi

FS_MAX="$(df -P 2>/dev/null | awk '''NR>1 {gsub(/%/,"",$5); if($5+0>m)m=$5+0} END {print m+0}''')"
FS_STATUS="$(status_used_pct "$FS_MAX")"

BLOCK_COUNT="$(sql_scalar_number <<SQL
set heading off feedback off pages 0 verify off echo off
select count(*) from gv${D}session where blocking_session is not null or final_blocking_session is not null;
exit;
SQL
)"
if [ "$BLOCK_COUNT" -gt 0 ] 2>/dev/null; then BLOCKING_STATUS="BLOQUEIOS_ATIVOS"; else BLOCK_COUNT=0; BLOCKING_STATUS="SEM_BLOQUEIOS"; fi

ASM_MAX_USED="$(sql_scalar_number <<SQL
set heading off feedback off pages 0 verify off echo off
select nvl(round(max((total_mb-free_mb)*100/nullif(total_mb,0)),2),0) from gv${D}asm_diskgroup;
exit;
SQL
)"
ASM_STATUS="$(status_used_pct "$ASM_MAX_USED")"

FRA_USED="$(sql_scalar_number <<SQL
set heading off feedback off pages 0 verify off echo off
select nvl(round(max(space_used*100/nullif(space_limit,0)),2),0) from gv${D}recovery_file_dest;
exit;
SQL
)"
FRA_STATUS="$(status_used_pct "$FRA_USED")"

RMAN_RUNNING="$(sql_scalar_number <<SQL
set heading off feedback off pages 0 verify off echo off
select count(*) from v${D}rman_backup_job_details where status like 'RUNNING%';
exit;
SQL
)"
if [ "$RMAN_RUNNING" -gt 0 ] 2>/dev/null; then RMAN_STATUS="RMAN_ATIVO"; else RMAN_RUNNING=0; RMAN_STATUS="SEM_RMAN_ATIVO"; fi

OVERALL_STATUS="SAUDAVEL"
OVERALL_RANK=1
for ST in "$CPU_STATUS" "$FS_STATUS" "$ASM_STATUS" "$FRA_STATUS" "$BLOCKING_STATUS"; do
  RANK="$(severity_rank "$ST")"
  if [ "$RANK" -gt "$OVERALL_RANK" ]; then OVERALL_RANK="$RANK"; OVERALL_STATUS="$ST"; fi
done
[ "$BLOCKING_STATUS" = "BLOQUEIOS_ATIVOS" ] && OVERALL_STATUS="EMERGENCIA"

say "CPU_IDLE=$CPU_IDLE CPU_STATUS=$CPU_STATUS"
say "FILESYSTEM_MAX_USED=$FS_MAX FILESYSTEM_STATUS=$FS_STATUS"
say "ASM_MAX_USED=$ASM_MAX_USED ASM_STATUS=$ASM_STATUS"
say "FRA_USED=$FRA_USED FRA_STATUS=$FRA_STATUS"
say "BLOCKING_COUNT=$BLOCK_COUNT BLOCKING_STATUS=$BLOCKING_STATUS"
say "RMAN_RUNNING=$RMAN_RUNNING RMAN_STATUS=$RMAN_STATUS"
say "OVERALL_STATUS=$OVERALL_STATUS"

say "===== RESUMO ====="
say "INCIDENTE=$INCIDENTE SID=$ORACLE_SID HOST=$(hostname -f 2>/dev/null || hostname) TOP=$TOP_N VERSION=$VERSION"
say "SYSOUT=$OUT"
[ -n "$AWR_FILE" ] && say "AWR=$AWR_FILE"
ERROR_COUNT="$(grep -cE '^(ORA-|SP2-|\[ERRO\])' "$OUT" 2>/dev/null || true)"
chmod 600 "$OUT" 2>/dev/null || true
say "SYSOUT_SHA256=$(sha256sum "$OUT" 2>/dev/null | awk '{print $1}')"
say "SYSOUT_PERMISSIONS=$(stat -c '%a' "$OUT" 2>/dev/null || echo N/A)"
say "ERROR_COUNT=$ERROR_COUNT"
[ -n "$AWR_FILE" ] && say "AWR_SHA256=$(sha256sum "$AWR_FILE" 2>/dev/null | awk '{print $1}')"
say "FIM=$(date '+%d/%m/%Y %H:%M:%S')"
SCRIPT
chmod 750 /tmp/oracle_profile_master.sh
bash -n /tmp/oracle_profile_master.sh && echo "[OK] SINTAXE BASH"
sha256sum /tmp/oracle_profile_master.sh
/tmp/oracle_profile_master.sh TESTE-V3.2-RC1.1
