# -*- coding: utf-8 -*-
import os, sys, json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def carregar_indice():
    idx_path = os.path.join(BASE_DIR, "kb_index.json")
    if os.path.exists(idx_path):
        with open(idx_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def main():
    print("=" * 68)
    print("  🚀 PARRADIBIEI - COPILOTO DE TROUBLESHOOTING GUIADO (CLI)")
    print("=" * 68)
    print("  Diagnostico interativo e seguro com 40 playbooks homologados.\n")
    
    playbooks = carregar_indice()
    if not playbooks:
        print("[!] Arquivo kb_index.json nao encontrado.")
        return

    print("Principais Sintomas Comuns:")
    print("  1. Bloqueio de Sessao / Fila de Locks (Enqueue TX / TM)")
    print("  2. Lentidao Geral / Query com SQL_ID Ofensor")
    print("  3. Fast Recovery Area (FRA) Cheia / Archive Esgotado")
    print("  4. Snapshot Too Old (ORA-01555) / Retencao de Undo")
    print("  5. Tablespace Perto de 100% / Risco de Queda")
    print("  6. Deadlock Detectado (ORA-00060)")
    print("  7. Pesquisar por Codigo de Erro ORA ou Palavra-Chave")
    print("  0. Sair\n")

    opcao = input("Escolha uma opcao [1-7]: ").strip()
    termo = ""
    if opcao == "1": termo = "lock"
    elif opcao == "2": termo = "lento"
    elif opcao == "3": termo = "archive"
    elif opcao == "4": termo = "1555"
    elif opcao == "5": termo = "tablespace"
    elif opcao == "6": termo = "00060"
    elif opcao == "7": termo = input("Digite o erro ORA ou palavra-chave: ").strip()
    else: return

    encontrados = []
    termo_lower = termo.lower()
    for pb in playbooks:
        if (termo_lower in pb.get("titulo", "").lower() or
            any(termo_lower in e.lower() for e in pb.get("erros_ora", [])) or
            any(termo_lower in t.lower() for t in pb.get("tags", []))):
            encontrados.append(pb)

    if not encontrados:
        print(f"\n[!] Nenhum playbook encontrado para '{termo}'.")
        return

    print(f"\n✔ Encontrado(s) {len(encontrados)} playbook(s):")
    for i, pb in enumerate(encontrados, 1):
        print(f"  [{i}] {pb['titulo']} ({pb['passos_count']} passos) - {pb['arquivo']}")

    escolha = 0
    if len(encontrados) > 1:
        try:
            escolha = int(input("\nEscolha o playbook [1..N]: ")) - 1
        except Exception:
            escolha = 0
    
    selecionado = encontrados[escolha]
    print("\n" + "=" * 68)
    print(f"  Roteiro Guiado: {selecionado['titulo']}")
    print(f"  Quando usar: {selecionado.get('quando_usar', '')}")
    print("=" * 68)
    
    caminho_pb = os.path.join(BASE_DIR, "..", "kb", selecionado["arquivo"])
    if not os.path.exists(caminho_pb):
        caminho_pb = os.path.join(BASE_DIR, "kb", selecionado["arquivo"])
        
    if os.path.exists(caminho_pb):
        with open(caminho_pb, 'r', encoding='utf-8') as f:
            detalhe = json.load(f)
            for idx, p in enumerate(detalhe.get("passos", []), 1):
                print(f"\n--- PASSO {idx}: {p.get('titulo', '')} ---")
                print(f"Objetivo: {p.get('objetivo', '')}")
                print(f"Risco: [{p.get('risco', 'leitura').upper()}]")
                print("\n[SQL Read-Only para Executar]:")
                print(p.get("comando", "").strip())
                print(f"\n👁️  O que olhar: {p.get('olhar', '')}")
                if p.get("armadilha"):
                    print(f"⚠️  Armadilha: {p.get('armadilha', '')}")
                input("\n[Pressione ENTER para ir ao proximo passo...]")
        print("\n✔ Troubleshooting concluido com sucesso.")

if __name__ == "__main__":
    main()
