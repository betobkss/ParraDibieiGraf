# Pacote Completo do ParraDibiei - API & Oracle DBA Grafana Studio

Este arquivo `ParraDibiei_Completo_Framework.zip` contém **100% dos 244 arquivos do projeto**:
- Todos os 43 Playbooks Oracle em JSON (`kb/`)
- Dashboards e Data Sources provisionados do Grafana v10 (`grafana/`)
- Servidor Exporter Prometheus de Métricas Oracle (`PARRA_EXPORTER_SERVER.py`)
- Motor de Histórico de Auditoria e Incidentes (`historico.json` e `HISTORICO.py`)
- Prompts e Regras Nativas para IA (`.github/copilot-instructions.md`, `INSTRUCOES_PARA_IA.md`, `.cursorrules`, `CLAUDE.md`)
- Aplicação Web Studio em React 19 + TypeScript + Tailwind CSS (`src/`)
- Scripts de Subida em 1 Clique (`iniciar_grafana.sh` e `iniciar_grafana.bat`)

## Como descompactar e usar localmente:

### Linux / macOS:
```bash
unzip ParraDibiei_Completo_Framework.zip -d ParraDibiei/
cd ParraDibiei
./iniciar_grafana.sh
npm install && npm run dev
```

### Windows (PowerShell ou Prompt de Comando):
```bat
tar -xf ParraDibiei_Completo_Framework.zip
cd ParraDibiei
iniciar_grafana.bat
npm install
npm run dev
```
