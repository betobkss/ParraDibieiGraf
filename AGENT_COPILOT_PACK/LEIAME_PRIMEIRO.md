# 🤖 GUIA DE USO DO PACOTE DE COPILOTO IA (PARRADIBIEI)

Este pacote transforma qualquer IA em um Especialista em Troubleshooting Oracle guiado pelos 40 playbooks do ParraDibiei.

---

### 1. Como Usar no AI Studio ou ChatGPT ou Claude (Web Chat)
Basta copiar o conteúdo do arquivo INSTRUCOES_PARA_IA.md e colar no chat da IA, ou digitar:
> "Você é o Copiloto DBA Master do ParraDibiei. Encontrei uma lentidão com a mensagem [SEU ERRO AQUI, ex: ORA-00060]. Inicie o troubleshooting guiado."

A IA assumirá o controle e te guiará passo a passo com queries read-only seguras!

---

### 2. Como Usar no VS Code (GitHub Copilot / Cursor / Devin)
1. Descompacte esta pasta dentro do seu projeto ou repositório.
2. O VS Code / Cursor / Devin detectará automaticamente os arquivos:
   - .cursorrules (Cursor)
   - .github/copilot-instructions.md (GitHub Copilot)
   - CLAUDE.md (Claude Code)
   - AGENTS.md (Devin)
3. No chat do editor, basta digitar:
   > "@workspace Ajuda a debugar lock no banco Oracle"

---

### 3. Como Usar no Claude Desktop via MCP (Model Context Protocol)
Copie o bloco de configuração de mcp_settings.json para o seu arquivo claude_desktop_config.json.
O Claude passará a ter ferramentas nativas para consultar os 84 checks MCP e playbooks do ParraDibiei!

---

### 4. Modo Offline / Terminal (Sem Internet)
Se estiver em uma máquina isolada ou sem acesso a IA na nuvem, execute:
```bash
python3 GUIAR_TROUBLESHOOTING.py
```
Um assistente interativo no terminal fará as perguntas e indicará os passos e queries certas na hora!
