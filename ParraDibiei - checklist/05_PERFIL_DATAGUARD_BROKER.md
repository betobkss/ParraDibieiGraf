# PERFIL ORACLE: DATAGUARD_BROKER
# ParraDibiei - Checklist Oficial de Data Guard, Broker e Serviços _rw / _ro

## PADRÃO BRASIL VALIDADO
- **PRIMARY:**
  - PDB em `READ WRITE`
  - Serviço com sufixo `_rw` ativo (ex: `app_rw`)
- **PHYSICAL STANDBY:**
  - PDB em `READ ONLY WITH APPLY`
  - Serviço com sufixo `_ro` ativo (ex: `app_ro`)
  - Serviço `_rw` inativo

## REGRAS DE OURO
- NUNCA determine o papel do banco pelo `DB_UNIQUE_NAME`! Sempre use `V$DATABASE.DATABASE_ROLE`.
- No Data Guard: Se tudo recebido estiver aplicado, investigue transporte antes do MRP.
- `STATUS=DEFERRED` sem erro não comprova causa.
- Nunca proponha escrita em standby read-only.
- Switchover deve ser tentado primeiro pelo Data Guard Broker (`dgmgrl`).

## PASSO 1: PAPEL E STATUS DE APLICAÇÃO
```sql
SELECT name, db_unique_name, open_mode, database_role, switchover_status FROM v$database;
SELECT process, status, sequence#, block#, blocks FROM v$managed_standby WHERE process LIKE 'MRP%';
```

## PASSO 2: CHECAGEM PELO BROKER
```bash
dgmgrl / "show configuration"
dgmgrl / "show database verbose <db_unique_name>"
```
