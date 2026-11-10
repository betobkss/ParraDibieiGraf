# ParraDibiei - API & Oracle DBA Grafana Studio 🚀

> **Framework Completo para DBAs Oracle, Engenharia de Confiabilidade (SRE) e Equipes de Operações de Banco de Dados de Missão Crítica.**
> 
> *100% Read-Only Inviolável · Homologado para Oracle RAC, Exadata, Multitenant (CDB/PDB) e Standalone · Copiloto de IA Integrado com Histórico de Incidentes.*

---

## 📋 Sumário
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Framework](#arquitetura-do-framework)
3. [Copiloto IA & Troubleshooting Guiado](#copiloto-ia--troubleshooting-guiado)
4. [Catálogo dos 43 Playbooks Oracle](#catálogo-dos-43-playbooks-oracle)
5. [Grafana Studio & Prometheus Exporter](#grafana-studio--prometheus-exporter)
6. [Gerenciamento de Histórico (`historico.json`)](#gerenciamento-de-histórico-historicojson)
7. [Como Subir Localmente](#como-subir-localmente)
8. [Uso com VS Code, Devin, Cursor e AI Studio](#uso-com-vs-code-devin-cursor-e-ai-studio)

---

## 🎯 Visão Geral
O **ParraDibiei** é um framework unificado criado para eliminar o estresse durante incidentes de produção em ambientes Oracle. Ele combina:
- **43 Playbooks de Diagnóstico Imediato** em JSON estruturado para os erros mais críticos (ORA-01555, ORA-00054, ORA-04031, ORA-01653, etc.).
- **Grafana Studio Embutido** com dashboards pré-provisionados para RAC, Locks, Esperas ASH, Tablespaces e Undo Retention.
- **Prometheus Metric Exporter nativo** em Python (`PARRA_EXPORTER_SERVER.py`) para monitoramento em tempo real sem sobrecarga no banco.
- **Copiloto IA Universal** com instruções nativas para GitHub Copilot, Devin, Claude Code, Cursor e Google AI Studio.
- **Histórico Auditável de Incidentes** (`historico.json` e `troubleshooting/`) que grava cada diagnóstico realizado para análise de causa raiz (RCA) e aprendizado contínuo.
- **Interface Web Studio** em React + Tailwind para consulta visual dos playbooks, dashboards, auditoria e simulações.

---

## 🏛️ Arquitetura do Framework

```text
ParraDibiei/
├── .github/
│   └── copilot-instructions.md    # Instruções nativas para GitHub Copilot
├── .cursorrules                   # Regras de contexto para Cursor IDE
├── .clinerules                    # Regras para Cline / Roo Code
├── CLAUDE.md                      # Regras para Claude Code / Anthropic
├── INSTRUCOES_PARA_IA.md          # System Prompt universal para qualquer LLM
├── kb/                            # 43 Playbooks em JSON estruturado
│   ├── 01_checklist_diario.json
│   ├── 02_sessoes_locks.json
│   ├── 03_sql_lento.json
│   ├── ... (até o playbook 43)
│   └── kb_index.json              # Índice unificado com busca rápida
├── grafana/                       # Dashboards e data sources provisionados
│   ├── dashboards/
│   └── provisioning/
├── docker-compose.grafana.yml     # Subida do Grafana + Prometheus
├── PARRA_EXPORTER_SERVER.py       # Exporter Prometheus em porta 9187
├── iniciar_grafana.sh             # Script 1-clique Linux / macOS
├── iniciar_grafana.bat            # Script 1-clique Windows
├── historico.json                 # Banco de histórico e aprendizado de casos
├── HISTORICO.py                   # CLI/API para registro de casos
├── GUIAR_TROUBLESHOOTING.py       # CLI interativo guiado
├── troubleshoot/                  # Ferramenta de auditoria e validação
├── src/                           # Código-fonte da aplicação Web Studio
│   ├── components/                # Componentes React (Header, Copilot, Playbooks, etc.)
│   ├── data/                      # Dados dos playbooks e casos
│   └── utils/                     # Utilitários e gerador de Blob ZIP
├── index.html                     # Entrypoint Web
└── package.json                   # Dependências e scripts npm
```

---

## 🤖 Copiloto IA & Troubleshooting Guiado

O framework foi projetado com a abordagem **"Drop-in AI"**: ao abrir esta pasta em qualquer assistente de inteligência artificial (**VS Code Copilot**, **Devin**, **Cursor**, **ChatGPT**, **AI Studio**), a IA lê automaticamente os arquivos de contexto e assume o papel de **DBA Sênior Especialista**.

### Regras Invioláveis do Copiloto:
1. **Disciplina Read-Only**: Apenas comandos `SELECT` em views de catálogo (`V$`, `GV$`, `DBA_`, `ALL_`, `USER_`).
2. **Segurança de Produção**: Proibição de comandos destrutivos (`DROP`, `DELETE`, `TRUNCATE`, `ALTER SYSTEM KILL SESSION` sem confirmação explicita de janela de manutenção).
3. **Padrão em 3 Fases**:
   - **Fase 1**: Diagnóstico rápido da causa raiz.
   - **Fase 2**: Aprofundamento (RAC `inst_id`, locks, esperas ASH, IO).
   - **Fase 3**: Solução oficial homologada pelo catálogo de playbooks.
4. **Registro de Caso**: Gravação imediata do incidente em `historico.json`.

---

## 📚 Catálogo dos 43 Playbooks Oracle

| Categoria | Códigos ORA / Temas | Risco |
|---|---|---|
| **Saúde Diária** | Checklist de Instâncias, Alert Log, Status de Discos ASM | Leitura |
| **Concorrência** | ORA-00054, Enq: TX - Row Lock Contention, Deadlocks ORA-00060 | Leitura / Mudança |
| **Performance** | ORA-01555 (Snapshot too old), SQL Lento, Esperas ASH, Planos de Execução | Leitura |
| **Armazenamento** | ORA-01653 / ORA-01654 (Unable to extend tablespace), Fast Recovery Area (FRA) | Leitura / Mudança |
| **Memória** | ORA-04031 (Shared Pool esgotada), PGA Aggregate Limit, Buffer Cache | Leitura |
| **Alta Disp.** | Data Guard Lag, RAC GC Buffer Busy Waits, Redo Log Switching | Leitura |
| **Manutenção** | Rebuild de Índices inválidos, Gathering de Estatísticas com DBMS_STATS | Mudança Homologada |

---

## 📊 Grafana Studio & Prometheus Exporter

### Como Iniciar em 1 Clique:
**Linux / macOS:**
```bash
chmod +x iniciar_grafana.sh
./iniciar_grafana.sh
```

**Windows:**
```bat
iniciar_grafana.bat
```

- **Grafana URL**: `http://localhost:3001` (Usuário: `admin` / Senha: `admin`)
- **Prometheus URL**: `http://localhost:9090`
- **ParraDibiei Exporter**: `http://localhost:9187/metrics`

---

## 📝 Gerenciamento de Histórico (`historico.json`)

Cada incidente resolvido gera um registro com rastreabilidade completa:
```bash
# Listar incidentes registrados
python3 HISTORICO.py listar
```

Estrutura de cada caso:
```json
{
  "id": "CASO-2026-001",
  "titulo": "Esgotamento de Tablespace USERS durante carga massiva",
  "ora_code": "ORA-01653",
  "data": "2026-11-05 14:32:10",
  "severidade": "ALTA",
  "status": "RESOLVIDO",
  "analise": "O tablespace USERS atingiu 99.8% do limite configurado sem autoextend.",
  "solucao_aplicada": "Adicionado datafile de 10GB com autoextend ativado via Playbook 09."
}
```

---

## 💻 Como Subir a Interface Web Studio

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Acesse no navegador
http://localhost:3000
```

---

## 📄 Licença
Distribuído sob licença MIT. Desenvolvido para máxima confiabilidade e segurança de dados em ambientes Oracle corporativos.
