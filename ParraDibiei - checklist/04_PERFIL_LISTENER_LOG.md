# PERFIL ORACLE: LISTENER_LOG_GROWTH
# ParraDibiei - Checklist Oficial de Listener Log e Filesystem Cheio

## THRESHOLDS HOMOLOGADOS
- Menor que 500 MB: **Saudável**
- 500 MB a menor que 1 GB: **Atenção**
- 1 GB a menor que 5 GB: **Crítico**
- Maior ou igual a 5 GB: **Emergência**

## REGRAS DE OURO
- NUNCA use `rm` em arquivo de log enquanto o listener estiver rodando (o processo mantém o inode aberto e o filesystem não libera o espaço!).
- Para rotacionar sem parar o listener: use cópia + truncamento via comando `lsnrctl set log_status off` ou `cp /dev/null listener.log`.

## PASSO 1: LOCALIZAR E MEDIR TAMANHO DO LOG DO LISTENER
```bash
lsnrctl status LISTENER1529 | grep -i "listener log file"
ls -lh $(lsnrctl status LISTENER1529 | grep -i "listener log file" | awk '{print $NF}')
```
