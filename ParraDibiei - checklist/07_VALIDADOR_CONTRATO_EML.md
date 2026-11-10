# PARRADIBIEI | VALIDADOR OFICIAL DE CONTRATO DE RELATÓRIO (.EML / HEALTH CHECK)

## OBJETIVO
Definir as regras estritas de auditoria estática e offline dos arquivos `.eml` gerados pelo framework ParraDibiei, assegurando 100% de integridade nos canais de comunicação com a gestão e clientes.

---

## 1. REGRAS GERAIS DE CONFORMIDADE (.EML)
1. **Operação 100% Offline:**
   - O validador (`troubleshoot/relatorio.py`) nunca abre conexões de rede, banco de dados ou APIs externas.
   - Utiliza exclusivamente a biblioteca padrão do Python (`email.parser`, `html.parser`, `pathlib`, `re`).
2. **Integridade de CIDs (Content-ID):**
   - Todo `<img src="cid:xxxx">` referenciado no corpo HTML **DEVE** ter um anexo binário correspondente no cabeçalho MIME com `Content-ID: <xxxx>`.
   - CIDs sem anexo embutido representam imagens quebradas no leitor do destinatário e são tratados como **ERRO IMPEDITIVO**.
3. **Controle de Rascunho:**
   - A presença da palavra `RASCUNHO` gera um **AVISO** em modo preliminar.
   - Em modo de entrega final (`--final`), a palavra `RASCUNHO` é promovida a **ERRO IMPEDITIVO**.

---

## 2. CONTRATO ESPECÍFICO: HEALTH CHECK
Para ser considerado válido, o relatório de Health Check deve atender a:
1. **Regra das 13 Imagens:**
   - Conter exatamente **13 anexos de imagem**.
   - Conter exatamente **13 referências a CIDs no HTML** (`i0` a `i12`).
2. **Coerência Temporal:**
   - O horário declarado no cabeçalho do relatório (ex: `09h56`) **DEVE coincidir exatamente** com o horário de término da janela declarada (ex: `janela 09h00 a 09h56`).
   - Divergências de horário indicam descompasso nos snapshots e invalidam o Health Check.

---

## 3. CONTRATO ESPECÍFICO: RELATÓRIO DE CONTENÇÃO & BLOQUEIOS
Para ser considerado válido, o relatório de contenção deve conter evidência visual em todas as 8 seções analíticas:
* `2.1`: Escopo do AWR (`p21`)
* `2.2`: Classes de espera (`p22`)
* `2.3`: Top eventos (`p23`)
* `2.4`: Top SQL (`p24`)
* `2.5`: Arquivo de bloqueios (`c5`)
* `2.6`: Quando começou / espera por dia (`c3`)
* `2.7`: Tempo médio por execução (`c4`)
* `2.8`: Mecanismo: plano e dicionário (`p28`)

Qualquer seção ausente ou sem imagem anexada gera aviso/erro impeditivo no validador.

---

## 4. COMANDOS OPERACIONAIS
```bash
# Validacao rapida de rascunho
python3 VALIDAR_RELATORIO.py caminho/do/relatorio.eml

# Validacao rigorosa para envio ao cliente (modo final)
python3 VALIDAR_RELATORIO.py --final caminho/do/relatorio.eml

# Execucao dos testes unitarios automatizados
python3 tests/test_relatorio.py
```
