# -*- coding: utf-8 -*-
"""Exportador de Métricas OpenMetrics / Prometheus para Grafana v10"""
def format_prometheus_metrics(case_name, health_score, findings, meta=None):
    db_name = meta.get("db", "ORCL") if meta else "ORCL"
    host_name = meta.get("host", "db-host") if meta else "db-host"
    labels = f'case="{case_name}",database="{db_name}",host="{host_name}"'
    lines = [
        "# HELP oracle_dba_health_score Pontuação de integridade e saúde do banco (0 a 100)",
        "# TYPE oracle_dba_health_score gauge",
        f"oracle_dba_health_score{{{labels}}} {health_score}",
        "# HELP oracle_dba_active_locks Sessões bloqueadas aguardando enqueue",
        "# TYPE oracle_dba_active_locks gauge",
        f"oracle_dba_active_locks{{{labels}}} {meta.get('active_locks_count', 0) if meta else 0}"
    ]
    return "\n".join(lines)
