# -*- coding: utf-8 -*-
import os, sys, json, time, argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

class MetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ('/metrics', '/metrics/'):
            # Formato OpenMetrics
            m = """# HELP oracle_dba_health_score Pontuação de integridade e saúde do banco
# TYPE oracle_dba_health_score gauge
oracle_dba_health_score{database="PRD_RAC",topology="RAC_EXADATA"} 88
# HELP oracle_dba_active_locks Sessões bloqueadas
# TYPE oracle_dba_active_locks gauge
oracle_dba_active_locks{database="PRD_RAC"} 0
# HELP oracle_dba_fra_used_percent Ocupação da FRA
# TYPE oracle_dba_fra_used_percent gauge
oracle_dba_fra_used_percent{database="PRD_RAC"} 64.2
# HELP oracle_dba_aas Average Active Sessions
# TYPE oracle_dba_aas gauge
oracle_dba_aas{database="PRD_RAC",type="active"} 2.4
oracle_dba_aas{database="PRD_RAC",type="max_cores"} 16.0
"""
            body = m.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif parsed.path in ('/status', '/status/'):
            body = json.dumps({"status": "online", "framework": "ParraDibiei", "version": "2.0.0"}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(body)
        else:
            body = b"<html><body><h1>ParraDibiei Metrics Exporter</h1><p><a href='/metrics'>/metrics</a></p></body></html>"
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(body)

def run(port=9889):
    httpd = HTTPServer(('', port), MetricsHandler)
    print(f"ParraDibiei Exporter rodando na porta {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
