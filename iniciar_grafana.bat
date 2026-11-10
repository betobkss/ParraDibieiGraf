@echo off
echo ================================================================
echo   🚀 PARRADIBIEI - OBSERVABILIDADE ORACLE DBA (GRAFANA V10)
echo ================================================================
cd /d "%~dp0"
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    docker compose -f docker-compose.grafana.yml up -d
    echo Grafana pronto em http://localhost:3001
    start http://localhost:3001
) else (
    start python PARRA_EXPORTER_SERVER.py
    start http://localhost:9889/metrics
)
pause
