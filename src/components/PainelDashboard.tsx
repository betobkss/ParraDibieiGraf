import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Layers,
  ShieldCheck,
  Activity,
  Copy,
  Check,
  Download,
  FileText,
  Search,
  Filter,
  Lock,
  Cpu,
  HardDrive,
  Wifi,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileCode,
  Share2,
} from 'lucide-react';
import { IncidentCase } from '../types/parradibiei';

interface PainelDashboardProps {
  lang: 'pt' | 'en';
  onCaseCreated?: (newCase: IncidentCase) => void;
}

export const PainelDashboard: React.FC<PainelDashboardProps> = ({
  lang,
  onCaseCreated,
}) => {
  // Sub-abas do Painel Oficial
  const [activeTab, setActiveTab] = useState<'ambiente' | 'coleta' | 'casos' | 'queries' | 'redija'>('ambiente');

  // Estado do Ambiente / Conexão
  const [ambiente, setAmbiente] = useState<'PROD' | 'HML' | 'DEV'>('PROD');
  const [host, setHost] = useState('db-prod-scan.corp.internal');
  const [porta, setPorta] = useState('1521');
  const [serviceName, setServiceName] = useState('ERPPROD_SRV');
  const [usuario, setUsuario] = useState('SYSTEM');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('connected');
  const [connectionLatency, setConnectionLatency] = useState<number>(14);

  // Estado da Coleta
  const [modoColeta, setModoColeta] = useState<'rapido' | 'completo' | 'parcial'>('rapido');
  const [isCollecting, setIsCollecting] = useState(false);
  const [coletaProgress, setColetaProgress] = useState(100);
  const [coletaLogs, setColetaLogs] = useState<string[]>([
    '[09:00:01] Conexao estabelecida via TNS: db-prod-scan.corp.internal:1521/ERPPROD_SRV',
    '[09:00:02] Modo de execucao: SET TRANSACTION READ ONLY [100% SEGURO]',
    '[09:00:03] Detectada topologia: Oracle 19c Enterprise RAC (2 nos ativos, Exadata X8-2)',
    '[09:00:05] S01: Verificacao de instâncias e servicos OK (Instancia 1: OPEN, Instancia 2: OPEN)',
    '[09:00:07] S02: Top Waits foreground: "enq: TX - row lock contention" (68% do DB Time)',
    '[09:00:10] S03: Identificada arvore de bloqueio ativa: Root Blocker SID 142 no No 1',
    '[09:00:12] S04: Mapeamento de espaco ASM e FRA (+RECO: 93.7% ocupado - Atencao)',
    '[09:00:14] Coleta finalizada com sucesso. Artefatos gravados em output/troubleshooting/INC000987654/',
  ]);

  // Estado dos Casos
  const [casoId, setCasoId] = useState('INC000987654');
  const [casoTitulo, setCasoTitulo] = useState('Bloqueio em Massa na Tabela TB_PAGAMENTOS (enq: TX)');
  const [casoSeveridade, setCasoSeveridade] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // Queries Catalog (as 13 queries oficiais do diretório queries/)
  const QUERIES_CATALOG = [
    {
      nome: 'locks.sql',
      titulo: 'Árvore de Bloqueio (Wait Chain / Root Blocker)',
      descricao: 'Identifica a raiz da fila de bloqueio em RAC usando GV$SESSION sem matar processos cegamente.',
      risco: 'READ-ONLY',
      sql: `SELECT LEVEL as nivel, inst_id, sid, serial#, username, status,
       event, seconds_in_wait, sql_id, blocking_session, machine
FROM gv$session
START WITH blocking_session IS NULL
  AND sid IN (SELECT blocking_session FROM gv$session WHERE blocking_session IS NOT NULL)
CONNECT BY PRIOR sid = blocking_session
ORDER SIBLINGS BY seconds_in_wait DESC;`,
    },
    {
      nome: 'sessions.sql',
      titulo: 'Sessões Ativas e Recursos Consumidos',
      descricao: 'Top sessões ativas agrupadas por CPU, I/O e eventos de espera em cluster RAC.',
      risco: 'READ-ONLY',
      sql: `SELECT s.inst_id, s.sid, s.serial#, s.username, s.program,
       s.sql_id, s.event, s.wait_class, s.seconds_in_wait,
       ROUND(m.cpu, 2) as cpu_usage
FROM gv$session s
LEFT JOIN gv$sessmetric m ON s.sid = m.sid AND s.inst_id = m.inst_id
WHERE s.status = 'ACTIVE' AND s.type != 'BACKGROUND'
ORDER BY s.seconds_in_wait DESC
FETCH FIRST 10 ROWS ONLY;`,
    },
    {
      nome: 'ash.sql',
      titulo: 'Active Session History (ASH Triage)',
      descricao: 'Amostragem dos últimos 15 minutos de sessões ativas para detectar picos repentinos.',
      risco: 'READ-ONLY',
      sql: `SELECT sample_time, session_state, event, wait_class, sql_id, count(*) as sessoes
FROM gv$active_session_history
WHERE sample_time > sysdate - (15/1440)
GROUP BY sample_time, session_state, event, wait_class, sql_id
ORDER BY sample_time DESC, sessoes DESC
FETCH FIRST 15 ROWS ONLY;`,
    },
    {
      nome: 'space.sql',
      titulo: 'Ocupação de Tablespaces, ASM e FRA',
      descricao: 'Capacidade física de discos, alertas de tablespace > 85% e percentual de recuperação da FRA.',
      risco: 'READ-ONLY',
      sql: `SELECT d.tablespace_name,
       ROUND(SUM(d.bytes)/1024/1024/1024, 2) as total_gb,
       ROUND(SUM(d.bytes - NVL(f.bytes,0))/1024/1024/1024, 2) as used_gb,
       ROUND((SUM(d.bytes - NVL(f.bytes,0))/SUM(d.bytes))*100, 1) as pct_used
FROM dba_data_files d
LEFT JOIN (SELECT tablespace_name, file_id, SUM(bytes) as bytes FROM dba_free_space GROUP BY tablespace_name, file_id) f
  ON d.tablespace_name = f.tablespace_name AND d.file_id = f.file_id
GROUP BY d.tablespace_name
ORDER BY pct_used DESC;`,
    },
    {
      nome: 'dataguard.sql',
      titulo: 'Data Guard & Broker Lag (MRP Status)',
      descricao: 'Sincronismo de redo, status do processo de recovery gerenciado (MRP0) e lag de transporte.',
      risco: 'READ-ONLY',
      sql: `SELECT process, status, thread#, sequence#, block#, blocks
FROM gv$managed_standby
WHERE process LIKE 'MRP%' OR process LIKE 'RFS%';`,
    },
    {
      nome: 'rman.sql',
      titulo: 'Auditoria de Backups RMAN',
      descricao: 'Status dos últimos backups de banco, archivelog e validação de janelas de retenção.',
      risco: 'READ-ONLY',
      sql: `SELECT session_key, input_type, status,
       TO_CHAR(start_time, 'DD/MM HH24:MI') as inicio,
       TO_CHAR(end_time, 'DD/MM HH24:MI') as fim,
       ROUND(elapsed_seconds/60, 1) as min,
       ROUND(output_bytes/1024/1024/1024, 2) as output_gb
FROM v$rman_backup_job_details
ORDER BY start_time DESC
FETCH FIRST 5 ROWS ONLY;`,
    },
  ];

  const [selectedQuery, setSelectedQuery] = useState(QUERIES_CATALOG[0]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const handleTestConnection = () => {
    setConnectionStatus('checking');
    setTimeout(() => {
      setConnectionStatus('connected');
      setConnectionLatency(Math.floor(Math.random() * 8) + 12);
    }, 800);
  };

  const handleRunColeta = () => {
    setIsCollecting(true);
    setColetaProgress(10);
    const timer = setInterval(() => {
      setColetaProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsCollecting(false);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header do Painel Dashboard Oficial */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Painel Oficial de Troubleshooting (PAINEL.py)
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Loopback: 127.0.0.1:8765 · 100% READ-ONLY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Interface oficial operacional do framework ParraDibiei. Conecta via TNS/EZConnect, orquestra coletas de triagem sem risco ao banco, mapeia árvores de bloqueio e gera relatórios para o ServiceNow / Support Platform.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs">
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-mono text-slate-300">{ambiente}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-mono">{connectionLatency}ms</span>
            </div>
          </div>
        </div>

        {/* Sub-Aba Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-indigo-900/60">
          <button
            onClick={() => setActiveTab('ambiente')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'ambiente'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>1. Ambiente & Conexão</span>
          </button>
          <button
            onClick={() => setActiveTab('coleta')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'coleta'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2. Coleta & Triage</span>
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'queries'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>3. Catálogo de Queries (queries/)</span>
          </button>
          <button
            onClick={() => setActiveTab('casos')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'casos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Gestão do Caso (CASO.py)</span>
          </button>
          <button
            onClick={() => setActiveTab('redija')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'redija'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>5. Redação & RCA</span>
          </button>
        </div>
      </div>

      {/* ABA 1: AMBIENTE & CONEXÃO */}
      {activeTab === 'ambiente' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-500" />
                <span>Configuração do Alvo Oracle (TNS / SCAN)</span>
              </h2>
              <span className="text-xs font-mono text-slate-500">AMBIENTES.py</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ambiente
                </label>
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold">
                  {(['PROD', 'HML', 'DEV'] as const).map((amb) => (
                    <button
                      key={amb}
                      onClick={() => setAmbiente(amb)}
                      className={`flex-1 py-1.5 rounded-md transition-all ${
                        ambiente === amb
                          ? amb === 'PROD'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {amb}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Host SCAN / IP do Servidor
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Porta Listener
                </label>
                <input
                  type="text"
                  value={porta}
                  onChange={(e) => setPorta(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Service Name / PDB
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Usuário DBA (Read-Only)
                </label>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Nenhuma senha é gravada em disco. Senha solicitada apenas via pipe STDIN do processo.</span>
              </span>
              <button
                onClick={handleTestConnection}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
                <span>Testar Conexão TNS</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Status da Conectividade</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Ping TNSPING OK</span>
                  <span>{connectionLatency} ms</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Listener ativo e respondendo na porta 1521. Endereço SCAN balanceado entre os nós 1 e 2.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Topologia Detectada (BLUEPRINT.py)
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Oracle Database 19c Enterprise Edition · RAC 2 Nós · Oracle ASM · Data Guard Standby Ativo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: COLETA & TRIAGE */}
      {activeTab === 'coleta' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  <span>Orquestrador de Coletas (COLETAR.py)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Executa baterias de extração read-only sem concorrência e com módulo auditável (TROUBLESHOOT-RO).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold">
                  {(['rapido', 'completo', 'parcial'] as const).map((modo) => (
                    <button
                      key={modo}
                      onClick={() => setModoColeta(modo)}
                      className={`px-3 py-1.5 rounded-md transition-all uppercase text-[11px] ${
                        modoColeta === modo ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Modo {modo}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRunColeta}
                  disabled={isCollecting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isCollecting ? 'animate-pulse' : ''}`} />
                  <span>{isCollecting ? 'Coletando...' : 'Iniciar Coleta Read-Only'}</span>
                </button>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isCollecting ? 'Extraindo métricas de gv$session e wait chains...' : 'Coleta Concluída'}
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {coletaProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${coletaProgress}%` }}
                />
              </div>
            </div>

            {/* Log Stream Output */}
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 space-y-1 max-h-64 overflow-y-auto select-all">
              {coletaLogs.map((l, i) => (
                <div key={i} className="leading-relaxed">
                  <span className="text-emerald-400">{l.slice(0, 10)}</span>
                  <span>{l.slice(10)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: CATÁLOGO DE QUERIES */}
      {activeTab === 'queries' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Queries Homologadas (queries/)</span>
            </h3>
            <div className="space-y-1.5">
              {QUERIES_CATALOG.map((q) => (
                <button
                  key={q.nome}
                  onClick={() => setSelectedQuery(q)}
                  className={`w-full text-left p-3 rounded-xl transition-all border text-xs flex items-center justify-between ${
                    selectedQuery.nome === q.nome
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-white font-bold'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-mono text-indigo-600 dark:text-indigo-400">{q.nome}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{q.titulo}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedQuery.titulo}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedQuery.descricao}
                </p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                {selectedQuery.risco}
              </span>
            </div>

            <div className="relative p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto select-all">
              <pre>{selectedQuery.sql}</pre>
              <button
                onClick={() => handleCopy(selectedQuery.nome, selectedQuery.sql)}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-all"
              >
                {copiedScript === selectedQuery.nome ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript === selectedQuery.nome ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: GESTÃO DO CASO */}
      {activeTab === 'casos' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <span>Ciclo de Vida do Incidente (CASO.py)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Criação, triagem, formulação de hipóteses e registro de RCA auditável.
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-mono rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
              SEVERIDADE: {casoSeveridade}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                ID do Chamado / Caso
              </label>
              <input
                type="text"
                value={casoId}
                onChange={(e) => setCasoId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Título do Incidente / Sintoma
              </label>
              <input
                type="text"
                value={casoTitulo}
                onChange={(e) => setCasoTitulo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              Artefatos do Caso Gerados pelo Framework:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span>meta.json (metadados)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>findings.csv (evidências)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>relatorio.md (RCA executivo)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: REDAÇÃO & RCA */}
      {activeTab === 'redija' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Redação para ServiceNow / Support Platform (redija.bat)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Texto sintetizado para atualização de chamado sem dados confidenciais de credenciais.
              </p>
            </div>
            <button
              onClick={() =>
                handleCopy(
                  'redija-text',
                  `INCIDENTE: ${casoId}\nSINTOMA: ${casoTitulo}\nAMBIENTE: ${ambiente} (Oracle 19c RAC)\nCAUSA: Sessao raiz SID 142 em status INACTIVE bloqueando tabela TB_PAGAMENTOS.\nACAO: Validado baixo volume de undo (42 registros). Executado ALTER SYSTEM KILL SESSION.\nSTATUS: Normalizado.`
                )
              }
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copiedScript === 'redija-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar Texto Formatado</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 space-y-2 select-all leading-relaxed">
            <p><strong>[ATUALIZAÇÃO DE INCIDENTE - PARRA DIBIEI DBA MASTER]</strong></p>
            <p><strong>Chamado:</strong> {casoId}</p>
            <p><strong>Sintoma:</strong> {casoTitulo}</p>
            <p><strong>Topologia:</strong> {ambiente} · Oracle Database 19c Enterprise · RAC 2 Nós (Exadata)</p>
            <p><strong>Triagem Realizada:</strong> Análise de wait chain via queries/locks.sql (Read-Only).</p>
            <p><strong>Evidência:</strong> Sessão SID 142 (APP_FINANCEIRO) inativa há 412s mantendo enq: TX em TB_PAGAMENTOS.</p>
            <p><strong>Ação Tomada:</strong> Confirmados apenas 42 registros no Undo (rollback imediato). Sessão encerrada de forma auditada.</p>
            <p><strong>Pós-Check:</strong> Fila de bloqueios zerada. DB Time normalizado em 96/100.</p>
          </div>
        </div>
      )}
    </div>
  );
};
