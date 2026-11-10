"""Gera os graficos das evidencias de contencao. Substitua os valores PREENCHER pelos do AWR/coleta da MESMA janela."""
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = os.path.join(os.environ["TEMP"], "graficos_contencao")
os.makedirs(OUT, exist_ok=True)

RED = "#C00000"
RED2 = "#E06666"
plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False})

# c5: 2.5 linhas do CSV JOB_BLOQUEOS_ASH por 10 min (S14a). PREENCHER: horarios e contagens.
hora = ["HH:MM"] * 12
linhas = [0] * 12
fig, ax = plt.subplots(figsize=(8, 3.4), dpi=130)
ax.bar(hora, linhas, color=RED, width=0.65)
ax.set_title("PREENCHER: titulo com data (JOB_BLOQUEOS_ASH)", fontsize=11)
ax.set_ylabel("linhas (sessão x minuto)")
ax.grid(axis="y", alpha=0.25)
plt.setp(ax.get_xticklabels(), rotation=45, ha="right", fontsize=8)
fig.tight_layout()
fig.savefig(os.path.join(OUT, "c5_bloqueios_10min.png"))
plt.close(fig)

# c3: 2.6 espera por dia (S07). PREENCHER: dias e valores.
dias = ["dd/mm"] * 8
tx = [0] * 8
fig, ax = plt.subplots(figsize=(8, 3.4), dpi=130)
bars = ax.bar(dias, tx, color=[RED2 if i < 4 else RED for i in range(len(dias))], width=0.6)
for b, v in zip(bars, tx):
    ax.text(b.get_x() + b.get_width() / 2, v, f"{v:,}".replace(",", "."), ha="center", fontsize=8)
ax.set_title("PREENCHER: titulo (espera por dia, coleta S07)", fontsize=11)
ax.set_ylabel("amostras (S07)")
ax.set_ylim(0, 1)
ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{int(v):,}".replace(",", ".")))
ax.grid(axis="y", alpha=0.25)
fig.tight_layout()
fig.savefig(os.path.join(OUT, "c3_tx_por_dia.png"))
plt.close(fig)

# c4: 2.7 ms por execucao do SQL de maior impacto (S11). PREENCHER: dias, ms e execucoes.
dias2 = ["dd/mm"] * 5
ms = [0.0] * 5
execs = ["0"] * 5
fig, ax = plt.subplots(figsize=(8, 3.4), dpi=130)
bars = ax.bar(dias2, ms, color=[RED2] * 3 + [RED] * 2, width=0.55)
for b, v, e in zip(bars, ms, execs):
    ax.text(b.get_x() + b.get_width() / 2, v, f"{v:.2f} ms\n{e} exec", ha="center", fontsize=8)
ax.set_title("PREENCHER: titulo (tempo medio por execucao, S11)", fontsize=11)
ax.set_ylabel("ms por execução")
ax.set_ylim(0, 1)
ax.grid(axis="y", alpha=0.25)
fig.tight_layout()
fig.savefig(os.path.join(OUT, "c4_ms_exec.png"))
plt.close(fig)

print("OK", sorted(os.listdir(OUT)))
