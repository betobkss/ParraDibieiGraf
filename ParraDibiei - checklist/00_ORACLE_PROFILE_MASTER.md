# ORACLE_PROFILE_MASTER v3.2-RC1.2
# ParraDibiei - Fonte Oficial de Triagem e Coleta Inicial

## FLUXO DE EXECUÇÃO PADRÃO
1. Detectar instâncias pelo PMON (`ps -ef | grep ora_pmon_ | grep -v grep`).
2. Resolver o Database ORACLE_HOME pelo `/etc/oratab` ou `sqlplus`.
3. Ajustar PATH e ORACLE_SID.
4. Validar conexão SYSDBA (`sqlplus -s / as sysdba`).
5. Coletar topologia e saúde em modo READ-ONLY.
6. Limitar rankings rigorosamente ao TOP 10.
7. Evitar caractere dollar literal em shell: usar `D=$(printf '\044')` e `v${D}database`.
8. Aplicar Pack-Gating antes de AWR ou ASH histórico (confirmar licença de Diagnostic Pack).
9. Encaminhar para o perfil específico com base nos sintomas.

## COMANDO PADRÃO DE DETECÇÃO (PASSO 1)
```bash
ps -ef | grep ora_pmon_ | grep -v grep | head -10
```

## COMANDO PADRÃO DE IDENTIFICAÇÃO DE INSTÂNCIA E PAPEL (PASSO 2)
```bash
D=$(printf '\044'); sqlplus -s / as sysdba <<EOF
set lines 220 pages 50 feedback off heading on
SELECT name, db_unique_name, open_mode, database_role FROM v${D}database;
SELECT inst_id, instance_name, status, version FROM gv${D}instance;
exit;
EOF
```
