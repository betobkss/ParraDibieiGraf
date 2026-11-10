# PERFIL ORACLE: ARCHIVER_STUCK
# ParraDibiei - Checklist Oficial de Stuck Archiver e Falta de Espaço em FRA/ARCH

## GATILHO DE ATIVAÇÃO
- Erros ORA-19504, ORA-19809, ORA-15041, ORA-00257
- Mensagens de `log file switch (archiving needed)`
- Diskgroup de ARCH ou FRA acima de 90%
- Banco entra em suspensão total (hang geral)

## CLASSIFICAÇÃO DE RISCO
- **EMERGÊNCIA CRÍTICA**: Se o percentual de uso de FRA/ARCH for >= 95% ou sessões em log switch.

## REGRAS DE OURO
- NUNCA use `rm -rf` no sistema operacional para apagar archivelog!
- NUNCA apague archives sem backup prévio pelo RMAN!

## PASSO 1: VERIFICAR OCUPAÇÃO EXATA E RECLAIMABLE
```sql
SELECT name, space_limit/1024/1024/1024 AS limit_gb,
       space_used/1024/1024/1024 AS used_gb,
       space_reclaimable/1024/1024/1024 AS reclaim_gb,
       ROUND((space_used/space_limit)*100, 1) AS pct_used
FROM v$recovery_file_dest;
```

## PASSO 2: IDENTIFICAR BACKLOG E ARCHIVES SEM BACKUP
```sql
SELECT inst_id, dest_id, status, error
FROM gv$archive_dest
WHERE status != 'INACTIVE';

SELECT COUNT(*) AS archives_sem_backup,
       ROUND(SUM(blocks * block_size)/1024/1024/1024, 2) AS gb_sem_backup
FROM v$archived_log
WHERE backup_count = 0 AND deleted = 'NO';
```
