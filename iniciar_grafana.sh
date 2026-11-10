#!/usr/bin/env bash
set -e
echo "🚀 Iniciando Observabilidade ParraDibiei (Grafana v10 + Prometheus)..."
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    docker compose -f docker-compose.grafana.yml up -d
    echo "✔ Grafana ativo em http://localhost:3001 (Login anônimo Admin ativo)"
    xdg-open "http://localhost:3001" 2>/dev/null || open "http://localhost:3001" 2>/dev/null || true
else
    echo "Iniciando exportador nativo de métricas Python na porta 9889..."
    python3 PARRA_EXPORTER_SERVER.py &
    echo "✔ Métricas em http://localhost:9889/metrics"
fi
