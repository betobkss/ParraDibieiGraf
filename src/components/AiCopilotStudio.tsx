import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Terminal,
  FileCode,
  Download,
  Copy,
  Check,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Cpu,
  Clock,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  FolderDown,
  Code2,
  Maximize2,
  Minimize2,
} from 'lucide-react';

import { IncidentCase } from '../types/parradibiei';
import {
  triggerZipDownload,
  PARRA_DIBIEI_FULL_ZIP_BASE64,
  PARRA_DIBIEI_COPILOT_ZIP_BASE64,
} from '../utils/zipData';

interface AiCopilotStudioProps {
  lang: 'pt' | 'en';
  onCaseResolved?: (newCase: IncidentCase) => void;
  onNavigateToHistory?: () => void;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  step?: {
    playbookName: string;
    stepNumber: number;
    title: string;
    objective: string;
    risk: 'leitura' | 'mudanca' | 'destrutivo';
    sql: string;
    whatToLook: string;
    trap: string;
    mockOutput?: string;
  };
  rcaSummary?: {
    rootCause: string;
    immediateAction: string;
    permanentFix: string;
    healthScoreImpact: string;
  };
}

export const AiCopilotStudio: React.FC<AiCopilotStudioProps> = ({
  lang,
  onCaseResolved,
  onNavigateToHistory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'guide' | 'files'>('simulator');
  const [selectedFileTab, setSelectedFileTab] = useState<'prompt' | 'claude' | 'cursor' | 'copilot' | 'mcp' | 'cli'>('prompt');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [inputProblem, setInputProblem] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCaseSavedToHistory, setIsCaseSavedToHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Escuta tecla ESC para sair de tela cheia
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Alterna Tela Cheia com suporte ao HTML5 Fullscreen API
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch {
        // Fallback CSS é acionado pelo isFullscreen
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {
        // Ignora
      }
    }
  };

  // Pre-configured simulation scenario: Enqueue TX Row Lock
  const initialMessages: Message[] = [
    {
      sender: 'bot',
      text: 'Olá! Sou o **Copiloto DBA Master do ParraDibiei**. Estou pronto para conduzir o troubleshooting guiado de qualquer incidente em banco Oracle, RAC ou Exadata.\n\n🛡️ **Garantia de Segurança:** Todos os passos operam em modo **READ-ONLY** e com **Gestão de Risco declarada**.',
      timestamp: 'Agora',
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const startSymptom = (symptomName: string, errorOra?: string) => {
    const userMsg: Message = {
      sender: 'user',
      text: errorOra
        ? `Identifiquei o erro ${errorOra}. A aplicação está reportando: "${symptomName}". Como procedemos?`
        : `Estamos com problema no banco: "${symptomName}". Inicie o troubleshooting guiado.`,
      timestamp: 'Agora',
    };

    let botResponse: Message;

    if (symptomName.includes('Lock') || (errorOra && errorOra.includes('00060'))) {
      botResponse = {
        sender: 'bot',
        text: 'Enquadrei o incidente no **Playbook 02: Sessões Travadas e Bloqueios (Lock)**. Concorrência na classe Application / Concurrency detectada.\n\nVamos isolar a árvore de bloqueio sem matar processos cegamente.',
        timestamp: 'Agora',
        step: {
          playbookName: '02_sessoes_locks.json',
          stepNumber: 1,
          title: 'Passo 1: Ver quem espera e identificar a raiz da árvore (Wait Chain)',
          objective: "Separar 'lentidão comum' de 'bloqueio real' e achar o Root Blocker.",
          risk: 'leitura',
          sql: `SELECT LEVEL AS nivel, inst_id, sid, serial#, username, status,
       event, seconds_in_wait, sql_id, blocking_session, machine
FROM gv$session
START WITH blocking_session IS NULL
  AND sid IN (SELECT blocking_session FROM gv$session WHERE blocking_session IS NOT NULL)
CONNECT BY PRIOR sid = blocking_session
ORDER SIBLINGS BY seconds_in_wait DESC;`,
          whatToLook: 'O nível 1 é a RAIZ: é essa sessão que abriu transação e não deu commit. seconds_in_wait alto e crescente confirma travamento.',
          trap: 'Nunca use V$SESSION em RAC! Em cluster você só vê o nó local e conclui falsamente que não há bloqueio.',
          mockOutput: `NIVEL INST_ID    SID SERIAL# USERNAME        STATUS   EVENT                          SECONDS SQL_ID        MACHINE
----- ------- ------ ------- --------------- -------- ------------------------------ ------- ------------- ---------------
    1       1    142   58201 APP_FINANCEIRO  INACTIVE SQL*Net message from client        412 8b492xma091   srv-app-prod02
    2       1    308   11942 API_CHECKOUT    ACTIVE   enq: TX - row lock contention      398 9x811a4fa02   srv-checkout01
    2       2    412   44129 ETL_NIGHT       ACTIVE   enq: TX - row lock contention      281 a0091bf2931   srv-etl04`,
        },
      };
      setCurrentStepIndex(1);
    } else if (symptomName.includes('1555') || (errorOra && errorOra.includes('1555'))) {
      botResponse = {
        sender: 'bot',
        text: 'Incidente enquadrado no **Playbook 08: Undo Tablespace & ORA-01555 Snapshot Too Old**.\n\nO erro ocorre quando uma query de longa duração tenta ler uma imagem consistente do bloco que já foi sobrescrito no UNDO.',
        timestamp: 'Agora',
        step: {
          playbookName: '08_undo_ora1555.json',
          stepNumber: 1,
          title: 'Passo 1: Verificar tempo de execução da query vs UNDO_RETENTION',
          objective: 'Descobrir se a query estourou a retenção configurada ou se houve falta de espaço físico no tablespace UNDO.',
          risk: 'leitura',
          sql: `SELECT begin_time, end_time, undoblks, txncount, maxquerylen,
       tuned_undoretention, unxpstealcnt, expstealcnt, ssolderrcnt
FROM gv$undostat
WHERE begin_time > sysdate - (1/24)
ORDER BY begin_time DESC;`,
          whatToLook: 'Se ssolderrcnt > 0: houve erro ORA-01555 no intervalo. Se unxpstealcnt > 0: o banco foi forçado a roubar blocos não expirados por falta de espaço.',
          trap: 'Aumentar UNDO_RETENTION não adianta se o tablespace de UNDO não tiver AUTOEXTEND ou espaço suficiente.',
          mockOutput: `BEGIN_TIME        END_TIME          UNDOBLKS TXNCOUNT MAXQUERYLEN TUNED_UNDORETENTION UNXPSTEALCNT EXPSTEALCNT SSOLDERRCNT
----------------- ----------------- -------- -------- ----------- ------------------- ----------- ----------- -----------
06/11/26 11:30:00 06/11/26 11:40:00    84200     1490        5400                3600           0        1420           1
06/11/26 11:20:00 06/11/26 11:30:00    91200     1620        4920                3600           0         980           0`,
        },
      };
      setCurrentStepIndex(1);
    } else if (symptomName.includes('FRA') || (errorOra && errorOra.includes('00257'))) {
      botResponse = {
        sender: 'bot',
        text: 'Incidente crítico enquadrado no **Playbook 04: Fast Recovery Area (FRA) e Archive Cheio**.\n\n⚠️ Risco Iminente: Se a FRA atingir 100%, o processo ARCH trava e todas as transações do banco entram em suspensão!',
        timestamp: 'Agora',
        step: {
          playbookName: '04_archive_cheio.json',
          stepNumber: 1,
          title: 'Passo 1: Medir ocupação exata por tipo de arquivo na FRA',
          objective: 'Identificar se o espaço foi tomado por archivelogs, backups antigos do RMAN ou flashback logs.',
          risk: 'leitura',
          sql: `SELECT name, space_limit/1024/1024/1024 AS limit_gb,
       space_used/1024/1024/1024 AS used_gb,
       space_reclaimable/1024/1024/1024 AS reclaim_gb,
       ROUND((space_used/space_limit)*100, 1) AS pct_used
FROM v$recovery_file_dest;`,
          whatToLook: 'pct_used > 85% exige ação. reclaim_gb mostra quanto o Oracle pode liberar automaticamente se o RMAN rodar.',
          trap: 'NUNCA use rm -rf no sistema operacional para apagar archivelog! O banco continuará achando que o espaço está ocupado no catálogo.',
          mockOutput: `NAME                           LIMIT_GB    USED_GB RECLAIM_GB   PCT_USED
------------------------------ -------- ---------- ---------- ----------
+RECO                               500      468.5       12.4       93.7%`,
        },
      };
      setCurrentStepIndex(1);
    } else {
      botResponse = {
        sender: 'bot',
        text: `Entendi o sintoma relatado: **"${symptomName}"**.\n\nConsultando a base de conhecimento de 40 playbooks... Encontrei correspondência de alta aderência. Vamos iniciar o diagnóstico com a primeira query de isolamento.`,
        timestamp: 'Agora',
        step: {
          playbookName: '03_sql_lento.json',
          stepNumber: 1,
          title: 'Passo 1: Mapear cursores com maior consumo de DB Time e CPU',
          objective: 'Identificar o SQL_ID ofensor e checar se houve troca de plano de execução (Plan Hash Value).',
          risk: 'leitura',
          sql: `SELECT sql_id, plan_hash_value, executions,
       ROUND(elapsed_time/DECODE(executions,0,1,executions)/1000,2) AS avg_ela_ms,
       ROUND(cpu_time/DECODE(executions,0,1,executions)/1000,2) AS avg_cpu_ms,
       buffer_gets/DECODE(executions,0,1,executions) AS avg_buffer_gets
FROM gv$sql
WHERE executions > 0
ORDER BY elapsed_time DESC
FETCH FIRST 5 ROWS ONLY;`,
          whatToLook: 'avg_buffer_gets alto = provável Full Table Scan por falta de índice. Mais de um plan_hash_value para o mesmo SQL_ID = regressão de plano.',
          trap: 'Olhar apenas elapsed_time total sem dividir por executions engana: um SQL rápido executado 1 milhão de vezes parecerá lento.',
          mockOutput: `SQL_ID        PLAN_HASH_VALUE EXECUTIONS AVG_ELA_MS AVG_CPU_MS AVG_BUFFER_GETS
------------- --------------- ---------- ---------- ---------- ---------------
3f910zkm9aa1       1849102911        142    4280.10    1920.40          489201
a9108bma091        294819201      18200       1.20       0.90              42`,
        },
      };
      setCurrentStepIndex(1);
    }

    setMessages([userMsg, botResponse]);
  };

  const advanceStep = () => {
    if (currentStepIndex === 1) {
      // Step 2: Undo Impact Evaluation
      const botResponse: Message = {
        sender: 'bot',
        text: 'Analisando a saída fornecida:\n\nDetectamos que a sessão **SID 142 (APP_FINANCEIRO)** no Nó 1 está com status `INACTIVE` há 412 segundos e é a **raiz de toda a fila** de bloqueio.\n\nAntes de qualquer comando de kill, a regra inviolável do ParraDibiei exige verificar o volume de UNDO para prever o tempo de rollback.',
        timestamp: 'Agora',
        step: {
          playbookName: '02_sessoes_locks.json',
          stepNumber: 2,
          title: 'Passo 2: Avaliar volume de Undo antes de matar a sessão',
          objective: 'Saber quantos registros foram alterados para prever se o rollback vai demorar segundos ou horas.',
          risk: 'leitura',
          sql: `SELECT s.inst_id, s.sid, s.serial#, s.username,
       TO_CHAR(t.start_date,'DD/MM HH24:MI:SS') AS inicio,
       ROUND((SYSDATE - t.start_date)*24*60,1) AS min_aberta,
       t.used_ublk AS blocos_undo, t.used_urec AS registros_undo
FROM gv$transaction t
JOIN gv$session s ON s.saddr = t.ses_addr AND s.inst_id = t.inst_id
WHERE s.sid = 142;`,
          whatToLook: 'used_ublk baixo (< 500) = rollback quase instantâneo. used_ublk alto (> 50.000) = rollback vai demorar muito; se matar, a fila continuará presa até o rollback terminar!',
          trap: 'Matar sessão achando que libera lock na hora: se a transação for grande, ela vira status KILLED e os locks SÓ liberam no fim do rollback.',
          mockOutput: `INST_ID    SID SERIAL# USERNAME        INICIO         MIN_ABERTA BLOCOS_UNDO REGISTROS_UNDO
------- ------ ------- --------------- -------------- ---------- ----------- --------------
      1    142   58201 APP_FINANCEIRO  06/11 11:35:10        6.8          18             42`,
        },
      };
      setMessages((prev) => [...prev, botResponse]);
      setCurrentStepIndex(2);
    } else if (currentStepIndex === 2) {
      // Step 3: Resolution & RCA
      const botResponse: Message = {
        sender: 'bot',
        text: 'Excelente! A sessão raiz possui apenas **18 blocos de undo (42 registros)**. O rollback levará menos de 1 segundo.\n\nPodemos prescrever o comando de resolução auditada e emitir o Relatório de Causa Raiz (RCA).',
        timestamp: 'Agora',
        step: {
          playbookName: '02_sessoes_locks.json',
          stepNumber: 3,
          title: 'Passo 3: Executar Kill Auditado com sintaxe exata para RAC',
          objective: 'Encerrar a sessão raiz e liberar imediatamente as 2 vítimas na fila.',
          risk: 'destrutivo',
          sql: `ALTER SYSTEM KILL SESSION '142,58201,@1' IMMEDIATE;`,
          whatToLook: 'Confira em gv$session após 5 segundos: a sessão deve desaparecer ou constar como KILLED e o evento enq: TX das vítimas deve zerar.',
          trap: 'Nunca mate processos PMON, SMON, DBW0, LGWR, CKPT ou processos de Data Guard/GoldenGate.',
        },
        rcaSummary: {
          rootCause: "Aplicação 'APP_FINANCEIRO' abriu transação de UPDATE na tabela TB_PAGAMENTOS e entrou em estado INACTIVE sem emitir COMMIT ou ROLLBACK devido a timeout de pooling de conexões no servidor srv-app-prod02.",
          immediateAction: "Executado ALTER SYSTEM KILL SESSION '142,58201,@1' IMMEDIATE após validação prévia de transação de baixo undo (42 registros). Fila normalizada imediatamente.",
          permanentFix: "Ajustar connection pool no servidor web (idle timeout de 60s) e corrigir código Java para garantir bloco try/finally com commit/rollback explícito.",
          healthScoreImpact: 'Health Score recuperado de 68/100 para 96/100.',
        },
      };
      setMessages((prev) => [...prev, botResponse]);
      setCurrentStepIndex(3);
    }
  };

  // Files content for viewing and copying
  const INSTRUCOES_PARA_IA_CONTENT = `# INSTRUÇÕES DO COPILOTO DBA MASTER (PARRADIBIEI)
# System Prompt Universal para AI Studio, ChatGPT, Claude, Devin, Cursor e VS Code

Você é o Copiloto DBA Master do ParraDibiei, framework corporativo de troubleshooting Oracle.

## 🎯 SEU PAPEL E OBJETIVO
Conduzir um troubleshooting guiado passo a passo garantindo máxima segurança operacional e sem nunca executar comandos destrutivos.

## 🛡️ REGRAS DE ENGAGEMENT INVIOLÁVEIS
1. READ-ONLY ABSOLUTO: Nunca proponha DDL ou DML destrutivo sem consentimento prévio.
2. GESTÃO DE RISCO: Rotule toda query como [LEITURA], [MUDANÇA] ou [DESTRUTIVO].
3. PACK-GATING: Não sugira views de Diagnostics Pack (AWR/ASH) sem licença confirmada.
4. RAC AWARENESS: Use sempre GV$ com inst_id em ambientes de cluster.
5. AVALIAÇÃO DE UNDO: Sempre investigue GV$TRANSACTION antes de matar qualquer sessão.`;

  const CLAUDE_MD_CONTENT = `# Claude Code & Desktop - ParraDibiei Oracle DBA
Você atua como DBA Master Especialista em Troubleshooting Oracle.
Base de Conhecimento ativa: 40 Playbooks (kb/) e 84 Verificações Read-Only (mcp/catalog.json).

Comandos rápidos:
- Iniciar Exporter: python3 PARRA_EXPORTER_SERVER.py --port 9889
- Iniciar Grafana: ./iniciar_grafana.sh
- Simular Incidente: python3 SIMULAR_CASO.py --tipo lock
- Diagnóstico: python3 -m troubleshoot.doctor`;

  const CURSOR_RULES_CONTENT = `# Regras do Cursor para o Framework ParraDibiei
Ao analisar incidentes Oracle:
1. Sempre priorize consultas na pasta kb/ para encontrar o playbook correto.
2. Indique a gravidade do risco em cada query:
   - 🟢 Risco: Leitura
   - 🟡 Risco: Mudança
   - 🔴 Risco: Destrutivo
3. Não use bibliotecas externas desnecessárias; priorize Python Standard Library.`;

  const COPILOT_MD_CONTENT = `# Instruções do GitHub Copilot para ParraDibiei
ParraDibiei é um framework de troubleshooting e observabilidade Oracle DBA.
Regras para Respostas:
1. Todo comando sugerido deve indicar Objetivo, Risco, O que olhar e Armadilha.
2. Sempre garanta sintaxe compatível com RAC (GV$ em vez de V$).`;

  const MCP_SETTINGS_CONTENT = `{
  "mcpServers": {
    "parradibiei-troubleshoot": {
      "command": "python3",
      "args": ["-m", "mcp.server"],
      "env": {
        "PYTHONPATH": "."
      }
    }
  }
}`;

  // Auto scroll para o final das mensagens
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStepIndex]);

  return (
    <div
      className={`space-y-4 transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-2 sm:p-4 flex flex-col w-full h-full overflow-hidden'
          : 'w-full'
      }`}
    >
      {/* Header Banner - Versão Slim quando em Tela Cheia, Completa em modo normal */}
      {isFullscreen ? (
        <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between text-white shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>Copiloto ParraDibiei DBA Master</span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  TELA CHEIA ATIVA
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Troubleshooting Guiado Passo a Passo · Modo 100% READ-ONLY · Comandos ASCII
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Pressione ESC ou clique para sair da tela cheia"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Sair da Tela Cheia (ESC)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Copiloto de Troubleshooting Guiado por IA
                  </h1>
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Universal: AI Studio · VS Code · Devin · Cursor · Claude
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Transforme qualquer inteligência artificial no seu <strong>DBA Master Copilot</strong>. Basta descompactar a pasta no seu projeto ou apontar o local para o chat: a IA reconhece as regras de segurança, consulta os 40 playbooks e conduz o diagnóstico passo a passo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {/* Fullscreen Zen Mode Button */}
              <button
                onClick={toggleFullscreen}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-400/40 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Expandir Chat para Tela Cheia (Zen Mode)"
              >
                <Maximize2 className="w-4 h-4 text-emerald-300" />
                <span>Expandir Tela Cheia</span>
              </button>

              <button
                onClick={() => triggerZipDownload(PARRA_DIBIEI_FULL_ZIP_BASE64, 'ParraDibiei_Completo_Com_Grafana_e_IA.zip')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all hover:scale-[1.02] active:scale-95"
              >
                <FolderDown className="w-4 h-4" />
                <span>Baixar Framework (.ZIP)</span>
              </button>
              <button
                onClick={() => triggerZipDownload(PARRA_DIBIEI_COPILOT_ZIP_BASE64, 'ParraDibiei_Copiloto_IA_Universal.zip')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Regras IA (16 KB)</span>
              </button>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-indigo-900/60">
            <button
              onClick={() => setActiveSubTab('simulator')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeSubTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>1. Simulador Interativo do Chat Copiloto</span>
            </button>
            <button
              onClick={() => setActiveSubTab('guide')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeSubTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Como Conectar no VS Code / Devin / Cursor / Claude</span>
            </button>
            <button
              onClick={() => setActiveSubTab('files')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeSubTab === 'files'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>3. Arquivos de Regras & Prompts</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: SIMULADOR INTERATIVO DO CHAT COPILOTO */}
      {activeSubTab === 'simulator' && (
        <div className={`space-y-3 ${isFullscreen ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
          {/* Quick Symptom Trigger Pills */}
          <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              💡 Clique em um sintoma comum para testar o Copiloto ao vivo:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  startSymptom('Sessão travada / Enqueue TX (Bloqueio)', 'ORA-00060')
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3 h-3" />
                <span>Bloqueio / Enq: TX (Sessão Travada)</span>
              </button>

              <button
                onClick={() =>
                  startSymptom('Snapshot Too Old / Retenção de Undo', 'ORA-01555')
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3 h-3" />
                <span>ORA-01555 Snapshot Too Old</span>
              </button>

              <button
                onClick={() =>
                  startSymptom('Fast Recovery Area (FRA) Cheia / Archive Esgotado', 'ORA-00257')
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>FRA em 94% (Risco ORA-00257)</span>
              </button>

              <button
                onClick={() =>
                  startSymptom('Query lenta com alto consumo de CPU e Buffers')
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/60 hover:bg-sky-100 transition-colors flex items-center gap-1.5"
              >
                <Cpu className="w-3 h-3" />
                <span>Lentidão / Regressão de Plano SQL</span>
              </button>
            </div>
          </div>

          {/* Interactive Chat Stream Area */}
          <div
            className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col ${
              isFullscreen ? 'flex-1 min-h-0' : 'h-[620px]'
            }`}
          >
            {/* Header Toolbar do Chat */}
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  DBA MASTER TERMINAL
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  READ-ONLY TRIAGE
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMessages(initialMessages);
                    setCurrentStepIndex(0);
                    setIsCaseSavedToHistory(false);
                  }}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs flex items-center gap-1"
                  title="Reiniciar conversa / Nova sessão"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Reiniciar</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 text-slate-700 dark:text-slate-200 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors text-xs flex items-center gap-1.5 font-semibold cursor-pointer"
                  title={isFullscreen ? 'Restaurar tamanho normal (ESC)' : 'Expandir Chat para Tela Cheia Total'}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[11px]">Sair Tela Cheia (ESC)</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-[11px]">Tela Cheia (Zen Mode)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Chat Messages Log */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm space-y-3 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* Step Card with Risk, SQL and Output if provided */}
                    {msg.step && (
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 text-xs mt-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {msg.step.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                              msg.step.risk === 'leitura'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : msg.step.risk === 'mudanca'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            Risco: {msg.step.risk}
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Objetivo:</strong> {msg.step.objective}
                        </p>

                        {/* SQL block */}
                        <div className="relative p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto select-all">
                          <pre>{msg.step.sql}</pre>
                          <button
                            onClick={() => handleCopy(`sql-${idx}`, msg.step!.sql)}
                            className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                          >
                            {copiedFile === `sql-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copiar SQL</span>
                          </button>
                        </div>

                        {/* What to look & Trap */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                              👁️ O que olhar no resultado:
                            </span>
                            <p className="text-slate-600 dark:text-slate-400">
                              {msg.step.whatToLook}
                            </p>
                          </div>
                          <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                            <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                              ⚠️ Armadilha clássica:
                            </span>
                            <p className="text-amber-700 dark:text-amber-400">
                              {msg.step.trap}
                            </p>
                          </div>
                        </div>

                        {/* Simulated Output Preview */}
                        {msg.step.mockOutput && (
                          <div className="space-y-1 pt-1">
                            <span className="font-bold text-slate-400 text-[10px] uppercase font-mono">
                              Saída Retornada pelo Oracle (GV$):
                            </span>
                            <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto select-all">
                              <pre>{msg.step.mockOutput}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* RCA Summary Box */}
                    {msg.rcaSummary && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3 text-xs mt-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Relatório Executivo de Causa Raiz (RCA ParraDibiei)</span>
                        </div>
                        <div className="space-y-1.5 text-slate-200">
                          <p>
                            <strong>Causa Raiz:</strong> {msg.rcaSummary.rootCause}
                          </p>
                          <p>
                            <strong>Ação Imediata:</strong> {msg.rcaSummary.immediateAction}
                          </p>
                          <p>
                            <strong>Correção Definitiva:</strong> {msg.rcaSummary.permanentFix}
                          </p>
                          <p>
                            <strong>Impacto na Saúde:</strong> {msg.rcaSummary.healthScoreImpact}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Step Advancement / Actions Bar */}
            {currentStepIndex > 0 && currentStepIndex < 3 && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {currentStepIndex === 1
                    ? 'Execute a query acima no Oracle e avance para a interpretação de UNDO.'
                    : 'Transação pequena confirmada. Pronto para prescrever o kill auditado.'}
                </span>
                <button
                  onClick={advanceStep}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>
                    {currentStepIndex === 1
                      ? 'Simular Saída da Query & Avançar'
                      : 'Prescrever Resolução & Gerar RCA'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Step 3 Finished: Save to Project History & Download Artifacts */}
            {currentStepIndex === 3 && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {isCaseSavedToHistory
                      ? '✔ Caso registrado com sucesso em troubleshooting/ e historico.json!'
                      : 'Investigação concluída. Deseja registrar este incidente no histórico do projeto?'}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {!isCaseSavedToHistory ? (
                    <button
                      onClick={() => {
                        const newCase: IncidentCase = {
                          id: `CASO_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_LOCK_04`,
                          titulo: 'Bloqueio de Sessão APP_FINANCEIRO (TB_PAGAMENTOS)',
                          data: new Date().toLocaleString(),
                          playbook_usado: '02_sessoes_locks.json',
                          severidade: 'CRITICAL',
                          status: 'RESOLVIDO',
                          health_score_inicial: 68,
                          health_score_final: 96,
                          causa_raiz: "Aplicação APP_FINANCEIRO entrou em status INACTIVE sem commit na tabela TB_PAGAMENTOS.",
                          acao_tomada: "Sessão raiz SID 142 encerrada após confirmação de apenas 42 registros no Undo.",
                          autor: 'Copiloto IA ParraDibiei & DBA',
                          arquivos: ['metadata.json', 'findings.csv', 'relatorio.md'],
                        };
                        setIsCaseSavedToHistory(true);
                        if (onCaseResolved) onCaseResolved(newCase);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Gravar no historico.json</span>
                    </button>
                  ) : (
                    onNavigateToHistory && (
                      <button
                        onClick={onNavigateToHistory}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <span>Ver no Histórico Vivo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Input Form Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputProblem.trim()) {
                  startSymptom(inputProblem);
                  setInputProblem('');
                }
              }}
              className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputProblem}
                onChange={(e) => setInputProblem(e.target.value)}
                placeholder="Ex: ORA-04031 shared pool esgotado, ou Sessão 291 travada..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: COMO CONECTAR NO VS CODE, DEVIN, CURSOR E CLAUDE */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: AI Studio & Web Chat */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    1. Google AI Studio & Web Chats
                  </h3>
                  <span className="text-[11px] text-slate-500">Claude, ChatGPT, Gemini Web</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Basta copiar o conteúdo de <code className="font-mono text-indigo-400">INSTRUCOES_PARA_IA.md</code> e colar no chat. Alternativamente, diga apenas:
              </p>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-sky-300 select-all">
                "Você é o Copiloto DBA Master do ParraDibiei. Encontrei o erro [ORA-00060]. Inicie o troubleshooting guiado."
              </div>
            </div>

            {/* Card 2: VS Code & GitHub Copilot */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    2. VS Code & GitHub Copilot
                  </h3>
                  <span className="text-[11px] text-slate-500">Copilot Chat & Inline Assist</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                O arquivo <code className="font-mono text-purple-400">.github/copilot-instructions.md</code> é lido automaticamente pelo GitHub Copilot no VS Code ao abrir o repositório.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-sky-300 select-all">
                @workspace Qual o playbook para analisar latch: cache buffers chains?
              </div>
            </div>

            {/* Card 3: Cursor & Windsurf IDE */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    3. Cursor & Windsurf IDE
                  </h3>
                  <span className="text-[11px] text-slate-500">.cursorrules Nativo</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                O Cursor detecta imediatamente o arquivo <code className="font-mono text-emerald-400">.cursorrules</code> na raiz do projeto e injeta a persona DBA Master e a exigência de Read-Only em todas as interações.
              </p>
            </div>

            {/* Card 4: Devin & Claude Code (MCP) */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    4. Devin & Claude Desktop (MCP)
                  </h3>
                  <span className="text-[11px] text-slate-500">Model Context Protocol</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                O Devin lê <code className="font-mono text-amber-400">AGENTS.md</code> e <code className="font-mono text-amber-400">.devin/rules/dba-master.md</code>. O Claude Desktop usa <code className="font-mono text-amber-400">mcp/server.py</code> via stdio para invocar os 84 checks de catálogo como ferramentas nativas!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARQUIVOS DE REGRAS E PROMPTS PRONTOS */}
      {activeSubTab === 'files' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            {/* File Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-2 bg-slate-50 dark:bg-slate-900/60 gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setSelectedFileTab('prompt')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                    selectedFileTab === 'prompt'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  INSTRUCOES_PARA_IA.md
                </button>
                <button
                  onClick={() => setSelectedFileTab('claude')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                    selectedFileTab === 'claude'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  CLAUDE.md
                </button>
                <button
                  onClick={() => setSelectedFileTab('cursor')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                    selectedFileTab === 'cursor'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  .cursorrules
                </button>
                <button
                  onClick={() => setSelectedFileTab('copilot')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                    selectedFileTab === 'copilot'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  copilot-instructions.md
                </button>
                <button
                  onClick={() => setSelectedFileTab('mcp')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                    selectedFileTab === 'mcp'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  mcp_settings.json
                </button>
              </div>

              <button
                onClick={() => {
                  const content =
                    selectedFileTab === 'prompt'
                      ? INSTRUCOES_PARA_IA_CONTENT
                      : selectedFileTab === 'claude'
                      ? CLAUDE_MD_CONTENT
                      : selectedFileTab === 'cursor'
                      ? CURSOR_RULES_CONTENT
                      : selectedFileTab === 'copilot'
                      ? COPILOT_MD_CONTENT
                      : MCP_SETTINGS_CONTENT;
                  handleCopy(selectedFileTab, content);
                }}
                className="px-3 py-1 text-xs rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                {copiedFile === selectedFileTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Arquivo</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
              <pre>
                {selectedFileTab === 'prompt' && INSTRUCOES_PARA_IA_CONTENT}
                {selectedFileTab === 'claude' && CLAUDE_MD_CONTENT}
                {selectedFileTab === 'cursor' && CURSOR_RULES_CONTENT}
                {selectedFileTab === 'copilot' && COPILOT_MD_CONTENT}
                {selectedFileTab === 'mcp' && MCP_SETTINGS_CONTENT}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
