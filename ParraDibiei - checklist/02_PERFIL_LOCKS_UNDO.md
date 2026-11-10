# PERFIL ORACLE: LOCKS_UNDO
# ParraDibiei - Checklist Oficial de Bloqueios e Enfileiramento

## GATILHO DE ATIVAÇÃO
- Erro ORA-00054 (resource busy and acquire with NOWAIT specified)
- Esperas em `enq: TX - row lock contention`, `enq: TM - contention`
- Aplicação congelada aguardando commit/rollback de transação anterior

## REGRAS DE OURO MANDATÓRIAS
- NUNCA use V$SESSION isolada em RAC (sempre GV$SESSION com INST_ID).
- NUNCA recomende kill de sessão antes de validar o volume de UNDO (USED_UBLK).
- Se a transação tiver mais de 50.000 blocos de undo, o rollback levará muito tempo e a fila continuará presa até o fim da recuperação!

## PASSO 1: ÁRVORE DE BLOQUEIO (ROOT BLOCKER)
```sql
SELECT LEVEL AS nivel, inst_id, sid, serial#, username, status,
       event, seconds_in_wait, sql_id, blocking_session, machine
FROM gv$session
START WITH blocking_session IS NULL
  AND sid IN (SELECT blocking_session FROM gv$session WHERE blocking_session IS NOT NULL)
CONNECT BY PRIOR sid = blocking_session
ORDER SIBLINGS BY seconds_in_wait DESC;
```

## PASSO 2: AVALIAÇÃO DE VOLUME DE UNDO ANTES DE QUALQUER KILL
```sql
SELECT s.inst_id, s.sid, s.serial#, s.username,
       ROUND((SYSDATE - t.start_date)*24*60,1) AS min_aberta,
       t.used_ublk AS blocos_undo, t.used_urec AS registros_undo
FROM gv$transaction t
JOIN gv$session s ON s.saddr = t.ses_addr AND s.inst_id = t.inst_id
WHERE s.sid = :SID_ROOT;
```
