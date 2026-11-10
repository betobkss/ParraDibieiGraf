#!/usr/bin/env bash
# ParraDibiei - Script para Push no GitHub
# Uso: ./push_to_github.sh <SEU_PERSONAL_ACCESS_TOKEN> [NOME_DO_REPO]

TOKEN="$1"
REPO="${2:-ParraDibieiGraf}"
USER="betobkss"

if [ -z "$TOKEN" ]; then
    echo "=========================================================="
    echo "ParraDibiei - Envio para o GitHub"
    echo "=========================================================="
    echo "Para enviar seu código para o GitHub, você pode:"
    echo "1) Passar o seu Personal Access Token como argumento:"
    echo "   ./push_to_github.sh ghp_SeuTokenAqui"
    echo ""
    echo "2) Ou executar diretamente via git standard:"
    echo "   git branch -M main"
    echo "   git remote set-url origin https://github.com/$USER/$REPO.git"
    echo "   git push -u origin main"
    echo "=========================================================="
    exit 1
fi

echo "Configurando remote autenticado..."
git branch -M main
git remote set-url origin "https://$TOKEN@github.com/$USER/$REPO.git"

echo "Enviando projeto completo para https://github.com/$USER/$REPO ..."
git push -u origin main --force

echo "Status do remote resetado para URL limpa (sem expor token)..."
git remote set-url origin "https://github.com/$USER/$REPO.git"

echo "Concluido com sucesso!"
