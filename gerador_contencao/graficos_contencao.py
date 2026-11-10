"""Gera os graficos das evidencias de contencao ParraDibiei (OECB1RET / Gravity).
Substitua os valores de exemplo ou integre com a extracao automatica do AWR/S14a.
Compativel com Windows, Linux e macOS (usa tempfile.gettempdir()).
"""
import os
import tempfile
import sys

def gerar_graficos(out_dir=None):
    if out_dir is None:
        out_dir = os.path.join(tempfile.gettempdir(), "graficos_contencao")
    os.makedirs(out_dir, exist_ok=True)

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        import matplotlib.ticker
    except ImportError:
        print("[ERRO] matplotlib nao instalado. Instale com: pip install matplotlib", file=sys.stderr)
        return out_dir

    RED = "#C00000"
    RED2 = "#E06666"
    plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False})

    # c5: 2.5 linhas do CSV JOB_BLOQUEOS_ASH por 10 min (S14a).
    hora = ["09:00", "09:10", "09:20", "09:30", "09:40", "09:50", "10:00", "10:10", "10:20", "10:30", "10:40", "10:50"]
    linhas = [14, 28, 45, 120, 240, 195, 110, 85, 42, 20, 12, 8]
    fig, ax = plt.subplots(figsize=(8, 3.4), dpi=130)
    ax.bar(hora, linhas, color=RED, width=0.65)
    ax.set_title("JOB_BLOQUEOS_ASH: Linhas por intervalo de 10 min (S14a)", fontsize=11, fontweight="bold")
    ax.set_ylabel("Linhas (sessao x minuto)")
    ax.grid(axis="y", alpha=0.25)
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right", fontsize=8)
    fig.tight_layout()
    c5_path = os.path.join(out_dir, "c5_bloqueios_10min.png")
    fig.savefig(c5_path)
    plt.close(fig)

    # c3: 2.6 espera por dia (S07).
    dias = ["01/11", "02/11", "03/11", "04/11", "05/11", "06/11", "07/11", "08/11"]
    tx = [1200, 1450, 1800, 2100, 9500, 14200, 18500, 8900]
    fig, ax = plt.subplots(figsize=(8, 3.4), dpi=130)
    bars = ax.bar(dias, tx, color=[RED2 if i < 4 else RED for i in range(len(dias))], width=0.6)
    for b, v in zip(bars, tx):
        ax.text(b.get_x() + b.get_width() / 2, v + (max(tx)*0.02), f"{v:,}".replace(",", "."), ha="center", fontsize=8)
    ax.set_title("Evolucao Historica: Amostras de Espera por Dia (Coleta S07)", fontsize=11, fontweight="bold")
    ax.set_ylabel("Amostras (S07)")
    ax.set_ylim(0, max(tx) * 1.15)
    ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{int(v):,}".replace(",", ".")))
    ax.grid(axis="y", alpha=0.25)
    fig.tight_layout()
    c3_path = os.path.join(out_dir, "c3_tx_por_dia.png")
    fig.savefig(c3_path)
    plt.close(fig)

    # c4: 2.7 ms por execucao do SQL de maior impacto (S11).
    dias2 = ["04/11", "05/11", "06/11", "07/11", "08/11"]
    ms = [1.2, 1.4, 85.6, 142.0, 98.4]
    execs = ["120k", "118k", "135k", "140k", "125k"]
    fig, ax = plt.subplots(figsize=(8, 3.4), dpi=130)
    bars = ax.bar(dias2, ms, color=[RED2] * 2 + [RED] * 3, width=0.55)
    for b, v, e in zip(bars, ms, execs):
        ax.text(b.get_x() + b.get_width() / 2, v + (max(ms)*0.03), f"{v:.1f} ms\n({e} exec)", ha="center", fontsize=8)
    ax.set_title("Tempo Medio por Execucao do SQL Ofensor (Coleta S11)", fontsize=11, fontweight="bold")
    ax.set_ylabel("ms por execucao")
    ax.set_ylim(0, max(ms) * 1.25)
    ax.grid(axis="y", alpha=0.25)
    fig.tight_layout()
    c4_path = os.path.join(out_dir, "c4_ms_exec.png")
    fig.savefig(c4_path)
    plt.close(fig)

    print(f"[OK] Graficos gerados em: {out_dir}")
    print("Arquivos:", sorted(os.listdir(out_dir)))
    return out_dir

if __name__ == "__main__":
    gerar_graficos()
