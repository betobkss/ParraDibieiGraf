# PERFIL ORACLE: CPU_SQL
# ParraDibiei - Checklist Oficial de CPU Elevada

## GATILHO DE ATIVAÇÃO
- CPU do host acima de 80% persistente
- Load average superior ao número de cores
- Processo Oracle ofensivo consumindo 100% de CPU

## EVIDÊNCIAS A COLETAR
1. TOP 10 processos no SO (`ps -eo pid,pcpu,pmem,args --sort=-pcpu | head -11`).
2. Mapeamento de PID para SID/SERIAL no banco.
3. Evento de espera, SQL_ID atual e plano de execução (Plan Hash Value).
4. Métricas de execução: CPU por execução, Elapsed time e Buffer Gets.

## COMANDO READ-ONLY DE TRIAGEM
```sql
SELECT * FROM (
    SELECT s.inst_id, s.sid, s.serial#, s.username, s.status,
           s.sql_id, q.plan_hash_value, s.event,
           ROUND(q.cpu_time/NULLIF(q.executions,0)/1000, 2) AS cpu_per_exec_ms,
           ROUND(q.elapsed_time/NULLIF(q.executions,0)/1000, 2) AS ela_per_exec_ms,
           ROUND(q.buffer_gets/NULLIF(q.executions,0), 0) AS gets_per_exec
    FROM gv$session s
    LEFT JOIN gv$sql q ON s.sql_id = q.sql_id AND s.inst_id = q.inst_id AND q.child_number = s.sql_child_number
    WHERE s.type = 'USER' AND s.status = 'ACTIVE'
    ORDER BY q.cpu_time DESC NULLS LAST
) WHERE ROWNUM <= 10;
```
