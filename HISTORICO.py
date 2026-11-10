# -*- coding: utf-8 -*-
"""
HISTORICO.py - Gerenciador de Histórico e Auditoria de Incidentes (ParraDibiei)
Permite ao Copiloto IA e ao DBA registrar novos casos, listar incidentes passados
e atualizar o historico.json automaticamente na pasta do projeto.
"""

import os
import sys
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HISTORICO_PATH = os.path.join(BASE_DIR, "historico.json")

def carregar_historico():
    """Carrega todos os casos do historico.json"""
    if os.path.exists(HISTORICO_PATH):
        try:
            with open(HISTORICO_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Erro ao carregar historico.json: {e}")
    return {"versao": "2.0.0", "casos": []}

def salvar_historico(data):
    """Grava o historico.json formatado"""
    with open(HISTORICO_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def registrar_caso(id_caso, titulo, playbook, severidade, causa_raiz, acao_tomada, score_ini=60, score_fim=95):
    """
    Registra um novo caso no historico.json e cria a pasta com relatorio.md e metadata.json
    em troubleshooting/<id_caso>
    """
    hist = carregar_historico()
    novo_caso = {
        "id": id_caso,
        "titulo": titulo,
        "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "playbook_usado": playbook,
        "severidade": severidade,
        "status": "RESOLVIDO",
        "health_score_inicial": score_ini,
        "health_score_final": score_fim,
        "causa_raiz": causa_raiz,
        "acao_tomada": acao_tomada,
        "autor": "Copiloto IA ParraDibiei & DBA",
        "arquivos": ["metadata.json", "findings.csv", "relatorio.md"]
    }
    hist.setdefault("casos", []).insert(0, novo_caso)
    hist["casos_totais"] = len(hist["casos"])
    hist["atualizado_em"] = datetime.now().isoformat() + "Z"
    salvar_historico(hist)
    print(f"✔ Caso '{id_caso}' registrado com sucesso no histórico do projeto.")

    # Cria a pasta do caso em troubleshooting/<id_caso>
    caso_dir = os.path.join(BASE_DIR, "troubleshooting", id_caso)
    os.makedirs(caso_dir, exist_ok=True)
    with open(os.path.join(caso_dir, "metadata.json"), "w", encoding="utf-8") as mf:
        json.dump(novo_caso, mf, indent=2, ensure_ascii=False)

    with open(os.path.join(caso_dir, "relatorio.md"), "w", encoding="utf-8") as rf:
        rf.write(f"# RELATÓRIO DE RCA - {id_caso}\n\n")
        rf.write(f"**Título:** {titulo}\n")
        rf.write(f"**Data:** {novo_caso['data']}\n\n")
        rf.write(f"## Causa Raiz\n{causa_raiz}\n\n")
        rf.write(f"## Ação Executada\n{acao_tomada}\n")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--listar":
        hist = carregar_historico()
        casos = hist.get("casos", [])
        print(f"=== HISTÓRICO DE INCIDENTES ({len(casos)} CASOS REGISTRADOS) ===")
        for c in casos:
            print(f"[{c['id']}] {c['data']} - {c['titulo']} ({c['status']}) - Health Score: {c.get('health_score_inicial')} -> {c.get('health_score_final')}")
    else:
        print("Uso: python HISTORICO.py --listar ou importe registrar_caso()")
