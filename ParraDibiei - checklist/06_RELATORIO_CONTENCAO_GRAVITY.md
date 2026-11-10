# PARRADIBIEI | PROTOCOLO OFICIAL DE RELATÓRIO DE CONTENÇÃO & BLOQUEIOS (GRAVITY / OECB1RET)

## OBJETIVO
Formalizar a estrutura obrigatória do Relatório de Contenção e Bloqueios em ambientes Oracle RAC de missão crítica, garantindo correlação fidedigna entre AWR Global, ASH, histórico de bloqueios (`JOB_BLOQUEOS_ASH`) e dicionário de dados.

---

## 1. REGRAS DE ENGAGEMENT & VERACIDADE DOS DADOS
1. **Mesma Janela Temporal Obrigatória:**
   - O AWR Global e as coletas operacionais (S00 a S14) **DEVEM** pertencer exatamente à mesma janela temporal do incidente.
   - É terminantemente proibido cruzar dados de dias, horas ou instâncias diferentes para justificar um sintoma.
2. **Preenchimento Baseado em Fatos:**
   - Campo sem evidência objetiva = `PENDENTE`.
   - **NUNCA** preencha com suposição, memória humana ou dados herdados de outro incidente.
3. **Formatação para E-mail (Compatibilidade Corporativa Outlook):**
   - **NUNCA** utilize tags `<pre>` soltas no HTML do e-mail (quebram alinhamento e tabelas no Outlook). Utilize divs estilizadas com `font-family: Consolas; white-space: pre-wrap;` ou tabelas.
   - Utilize cabeçalho MIME `X-Unsent: 1` para que o arquivo `.eml` abra diretamente no Outlook como rascunho de revisão.
4. **Governança de Produção:**
   - Nenhuma ação corretiva direta pode ser executada sem CHG homologada, janela aprovada, evidência anexada e plano de rollback testado.

---

## 2. ESTRUTURA OFICIAL DO RELATÓRIO (8 SEÇÕES OBRIGATÓRIAS)

Todo relatório de contenção do framework ParraDibiei deve conter as seguintes seções com imagens vinculadas via Content-ID (CID):

### 1. Resumo Executivo
* **O que aconteceu:** Evento principal de espera com tempo acumulado em segundos e contagem de esperas (extraído do AWR Foreground Wait Events). Pico horário e % de DB CPU.
* **Causa:** Declarada somente se comprovada pelo plano de execução (`dbms_xplan`), note ou dicionário de dados. Caso contrário, classificar formalmente como `Aberta` ou `Em Investigação`.
* **Desde quando:** Primeiro dia em que o comportamento anômalo surgiu (comprovado pela série temporal S07).
* **Relação com relatório anterior:** Comparação normalizada por hora de janela (taxa de eventos/hora), e não pela duração total bruta.
* **O que fazer:** Proposta de mitigação/piloto via CHG com critério objetivo de sucesso.

### 2. Evidências Técnicas (AWR Global RAC)
* **2.1 Escopo do AWR (`cid:p21`):**
  - Snapshot Inicial e Final, duração exata em minutos, contagem de instâncias RAC ativas, nome do PDB/CDB e carga média.
* **2.2 Classes de Espera (`cid:p22`):**
  - % do DB Time por classe: `DB CPU`, `Application`, `Concurrency`, `Cluster`, `User I/O`.
* **2.3 Top Eventos de Espera (`cid:p23`):**
  - Ranking dos Top 5 eventos do cluster: esperas totais, tempo total (s), média por espera (ms) e classe.
* **2.4 Top SQL por Elapsed Time (`cid:p24`):**
  - Mapeamento dos `SQL_ID` ofensores globais, tempo decorrido acumulado, contagem de execuções e tempo por execução.
* **2.5 Arquivo de Bloqueios (`JOB_BLOQUEOS_ASH` - `cid:c5`):**
  - Gráfico temporal de barras com intervalo de 10 minutos (S14a).
  - Tabela com Top 5 combinações de `Evento | Objeto`.
  - Nota explicativa: essa contagem mede persistência temporal (sessão × minuto), distinta do indicador pontual do Health Check.
* **2.6 Histórico de Início da Espera (`cid:c3`):**
  - Gráfico de barras com amostras acumuladas por dia (coleta S07).
  - Indicação explícita de dias parciais ou dados em coleta.
* **2.7 Tempo Médio por Execução do SQL Ofensor (`cid:c4`):**
  - Gráfico comparativo de milissegundos por execução ao longo dos dias para o mesmo `PLAN_HASH_VALUE` (coleta S11).
  - Buffer gets médios por execução para comprovar degradação de plano ou volume.
* **2.8 Mecanismo: Plano e Dicionário (`cid:p28`):**
  - Plano de execução real capturado da memória ou AWR com seção `Note` (uso de SQL Patch, SQL Profile, SPM Baseline).
  - Status e timestamp de criação de SQL Patches no dicionário (`DBA_SQL_PATCHES` - S12).
  - Parâmetros ativos de Result Cache (`RESULT_CACHE_MODE`, `RESULT_CACHE_MAX_SIZE` - S13).

### 3. Matriz de Hipóteses Testadas
Tabela numerada contendo:
* `#`: Identificador sequencial da hipótese.
* `Hipótese`: Formulação técnica (ex: *Degradação por falta de índice no predicado X*).
* `Evidência`: Coleta objetiva que testou a hipótese (ex: *Plano de execução confirmou Index Range Scan em IDX_01*).
* `Resultado`: Classificação estrita entre:
  - `Descartada`: Evidência refuta diretamente a hipótese.
  - `Não sustentada`: Evidência insuficiente para corroborar.
  - `Confirmada (mecanismo)`: Evidência comprova o mecanismo causador.
  - `Aberta`: Requer coleta adicional na próxima janela.

### 4. Plano de Ação em 4 Fases
* **Fase 0 – Imediata (Read-Only):** Ações de observabilidade passiva sem risco ao banco.
* **Fase 1 – Piloto (CHG):** Aplicação controlada da solução (ex: SQL Patch direcionado ou hint) em janela homologada.
* **Fase 2 – Expansão (CHG):** Replicação para nós secundários ou queries correlatas após validação dos critérios de sucesso.
* **Fase 3 – Processo & Prevenção:** Ajuste no pipeline de deploy, monitoramento proativo no Dynatrace/Grafana e capacitação da equipe.

---

## 3. CHECKLIST DE VALIDAÇÃO PRÉ-ENVIO
Antes de disparar o e-mail para a liderança ou clientes:
1. Executar validação offline do contrato:
   ```bash
   python3 VALIDAR_RELATORIO.py --final relatorio_contencao.eml
   ```
2. Garantir 0 CIDs quebrados.
3. Garantir ausência do selo `RASCUNHO` na versão final.
4. Conferir a versão gerada com imagens inline (`contencao_modelo_conferencia.html`) em navegador Chrome.
