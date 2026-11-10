# Instruções do GitHub Copilot para ParraDibiei

## Contexto do Projeto
ParraDibiei é um framework de troubleshooting e observabilidade Oracle DBA (RAC, Exadata, Single Instance).
Possui 40 playbooks em kb/ com 350 passos operacionais com gestão de risco.

## Regras para Respostas de Troubleshooting
1. Todo comando sugerido deve indicar:
   - Objetivo
   - Risco: Leitura | Mudança | Destrutivo
   - O que olhar no resultado
   - Armadilha clássica
2. Sempre garanta sintaxe compatível com RAC (GV$ em vez de V$).
3. Respeite as licenças (não sugira views de Diagnostics Pack sem licença).
