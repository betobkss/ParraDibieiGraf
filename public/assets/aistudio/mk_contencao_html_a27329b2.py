"""Modelo do e-mail de contencao. Todo texto entre [PREENCHER: ...] vem do AWR e da coleta da MESMA janela."""
import base64
import email.message
import email.utils
import os
from email import policy

TMP = os.environ["TEMP"]
GR = os.path.join(TMP, "graficos_contencao")
OUT = os.path.join(TMP, "contencao_modelo.eml")
SUBJ = "Gravity (OECB1RET) - Contenção/bloqueios DD/MM/AAAA HHhMM-HHhMM - causa e plano de ação"

# cid -> arquivo PNG gerado por graficos_contencao.py e prints do AWR
IMGS = [
    ("p21", "p21_escopo.png"),
    ("p22", "p22_classes_espera.png"),
    ("p23", "p23_top_eventos.png"),
    ("p24", "p24_top_sql.png"),
    ("c5", "c5_bloqueios_10min.png"),
    ("c3", "c3_tx_por_dia.png"),
    ("c4", "c4_ms_exec.png"),
]

CSS = """
body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#000;margin:0}
.wrap{max-width:980px;padding:8px 14px}
h1{color:#C00000;font-size:17pt;margin:6px 0 4px 0}
.sub{font-size:9.5pt;color:#444;margin:0 0 6px 0}
.rasc{font-size:9pt;color:#7F7F7F;margin:0 0 10px 0;font-style:italic}
h2{color:#C00000;font-size:13pt;margin:20px 0 8px 0;padding-bottom:3px;border-bottom:2px solid #C00000}
h3{font-size:10.5pt;margin:14px 0 4px 0;font-weight:bold}
.box{background:#FDECEC;border-left:4px solid #C00000;padding:8px 12px;margin:6px 0 10px 0}
.box p{margin:5px 0;line-height:1.35}
table{border-collapse:collapse;margin:6px 0 4px 0;font-size:9.5pt}
th{background:#DCE6F1;border:1px solid #8EA9DB;padding:3px 9px;text-align:left}
td{border:1px solid #8EA9DB;padding:3px 9px;text-align:left;vertical-align:top}
.nota{font-size:8.5pt;color:#555;margin:3px 0 8px 0}
img{max-width:100%;height:auto;display:block;margin:4px 0 6px 0}
pre{font-family:Consolas,'Courier New',monospace;font-size:8.5pt;background:#F5F5F5;border:1px solid #D0D0D0;padding:7px;white-space:pre-wrap}
ul{margin:4px 0 6px 18px;padding:0}
li{margin:2px 0}
.fim{margin-top:18px}
"""


def img(cid, legenda):
    return f'<img src="cid:{cid}" alt="{legenda}"><div class="nota">{legenda}</div>'


HTML = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="wrap">

<h1>Gravity (OECB1RET) – Contenção e bloqueios de DD/MM/AAAA, HHhMM–HHhMM</h1>
<p class="sub">Relatório gerencial resumido – base: AWR global RAC (snaps [PREENCHER: ini–fim], janela [PREENCHER]), ASH, arquivo do JOB_BLOQUEOS_ASH (coleta S01–S14) e dicionário, tudo coletado só em leitura no primary [PREENCHER: WORKA/WORKB] ([PREENCHER: db], [PREENCHER: nº] instâncias).</p>
<p class="rasc">RASCUNHO para revisão, não enviado.</p>

<h2>1. Resumo executivo</h2>
<div class="box">
<p><b>O que aconteceu:</b> [PREENCHER: evento principal com tempo em s e nº de esperas, do AWR]. [PREENCHER: DB CPU % do DB time e pico por horário].</p>
<p><b>Causa:</b> [PREENCHER: só se provada pelo plano/dicionário; caso contrário, "Aberta"]. [PREENCHER: contribuintes, com evidência].</p>
<p><b>Desde quando:</b> [PREENCHER: primeiro dia com o padrão, com valores por dia da coleta S07].</p>
<p><b>Relação com o relatório anterior:</b> [PREENCHER: comparação por hora de janela, não por duração total].</p>
<p><b>O que fazer:</b> [PREENCHER: piloto por CHG, medição e critério de expansão].</p>
</div>

<h2>2. Evidências (AWR global RAC, [PREENCHER: data e janela])</h2>

<h3>2.1 Escopo do AWR: [PREENCHER: snaps, minutos de janela, nº de instâncias, PDB]</h3>
{img("p21", "AWR – Database Summary")}

<h3>2.2 Classes de espera (% do DB time, cluster): [PREENCHER: DB CPU %; Application %; Cluster %]</h3>
{img("p22", "AWR – Foreground Wait Classes")}

<h3>2.3 Top eventos (AWR, cluster)</h3>
<ul>
<li>[PREENCHER: evento]: [PREENCHER: esperas], [PREENCHER: tempo em s]</li>
</ul>
{img("p23", "AWR – Foreground Wait Events (Global)")}

<h3>2.4 Top SQL (AWR, elapsed global)</h3>
<ul>
<li>[PREENCHER: sql_id]: [PREENCHER: elapsed em s], [PREENCHER: execuções]</li>
</ul>
{img("p24", "AWR – SQL ordered by Elapsed Time (Global)")}

<h3>2.5 Arquivo de bloqueios (JOB_BLOQUEOS_ASH): sessões em espera a cada 10 min</h3>
{img("c5", "Linhas do CSV JOB_BLOQUEOS_ASH por 10 min (S14a)")}
<table>
<tr><th>Evento | objeto (top 5, linhas do arquivo)</th><th>Linhas</th></tr>
<tr><td>[PREENCHER: evento | objeto]</td><td>[PREENCHER]</td></tr>
</table>
<div class="nota">Esta contagem não é a métrica "bloqueios &gt; 5 s" do Health Check. [PREENCHER: quem espera e quem bloqueia, da coleta S05 e S06b].</div>

<h3>2.6 Quando começou: espera por dia (coleta S07)</h3>
{img("c3", "Espera por dia (S07)")}
<table>
<tr><th>Dia</th><th>[PREENCHER: evento]</th><th>[PREENCHER: evento]</th></tr>
<tr><td>[PREENCHER: dd/mm]</td><td>[PREENCHER]</td><td>[PREENCHER]</td></tr>
</table>
<div class="nota">[PREENCHER: dias parciais e dados pendentes].</div>

<h3>2.7 Tempo médio por execução do [PREENCHER: sql_id] (mesmo plano, [PREENCHER: phv]; coleta S11)</h3>
<table>
<tr><th>Dia</th><th>Execuções</th><th>Buffer gets por exec</th><th>ms por exec</th></tr>
<tr><td>[PREENCHER]</td><td>[PREENCHER]</td><td>[PREENCHER]</td><td>[PREENCHER]</td></tr>
</table>
{img("c4", "Tempo médio por execução – [PREENCHER: sql_id]")}

<h3>2.8 Mecanismo: plano e dicionário (coleta S11 e S12)</h3>
<pre>[PREENCHER: plano do SQL e Note (SQL patch / profile), copiado da coleta]</pre>
<ul>
<li>[PREENCHER: status e data do SQL patch, do dicionário S12]</li>
<li>[PREENCHER: parâmetros de Result Cache, da coleta S13]</li>
</ul>

<h2>3. Como chegamos à causa (hipóteses testadas)</h2>
<table>
<tr><th>#</th><th>Hipótese</th><th>Evidência</th><th>Resultado</th></tr>
<tr><td>1</td><td>[PREENCHER]</td><td>[PREENCHER]</td><td>[Descartada / Não sustentada / Confirmada (mecanismo) / Aberta]</td></tr>
</table>

<h2>4. Plano de ação</h2>
<table>
<tr><th>Fase</th><th>Ação</th><th>Risco</th><th>Rollback</th><th>Dono</th></tr>
<tr><td>0 – Já (só leitura)</td><td>[PREENCHER]</td><td>Nenhum</td><td>–</td><td>DBA</td></tr>
<tr><td>1 – Piloto (CHG)</td><td>[PREENCHER]</td><td>[PREENCHER]</td><td>[PREENCHER]</td><td>DBA</td></tr>
<tr><td>2 – Expandir (CHG)</td><td>[PREENCHER]</td><td>[PREENCHER]</td><td>[PREENCHER]</td><td>DBA</td></tr>
<tr><td>3 – Processo</td><td>[PREENCHER]</td><td>Nenhum</td><td>–</td><td>[PREENCHER]</td></tr>
</table>

<p class="fim">Nenhuma alteração foi feita em produção. Todas as ações acima dependem de CHG aprovada, com janela e validação.</p>
<p>Atenciosamente,<br>[PREENCHER: nome e equipe]</p>

</div></body></html>"""

TXT = ("Gravity (OECB1RET) - Contenção e bloqueios [PREENCHER: data e janela]\n"
       "Este e-mail tem versão HTML com gráficos e tabelas. Abra a versão HTML.\n"
       "RASCUNHO para revisão, não enviado.\n")

msg = email.message.EmailMessage(policy=policy.SMTP)
msg["Subject"] = SUBJ
msg["Date"] = email.utils.formatdate(localtime=True)
msg["X-Unsent"] = "1"
msg.set_content(TXT, charset="utf-8", cte="base64")
msg.add_alternative(HTML, subtype="html", charset="utf-8", cte="base64")
html_part = msg.get_body(preferencelist=("html",))
for cid, arq in IMGS:
    with open(os.path.join(GR, arq), "rb") as fh:
        html_part.add_related(fh.read(), maintype="image", subtype="png", cid=f"<{cid}>", filename=arq)
with open(OUT, "wb") as f:
    f.write(bytes(msg))

# HTML de conferência com imagens inline (base64)
conf = HTML
for cid, arq in IMGS:
    with open(os.path.join(GR, arq), "rb") as fh:
        conf = conf.replace(f"cid:{cid}", "data:image/png;base64," + base64.b64encode(fh.read()).decode())
with open(os.path.join(TMP, "contencao_modelo_conferencia.html"), "w", encoding="utf-8") as f:
    f.write(conf)
print(OUT, os.path.getsize(OUT))
