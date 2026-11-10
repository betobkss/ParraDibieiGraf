import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Cpu,
  HardDrive,
  Database,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PlaybookItem } from '../types/parradibiei';

interface PlaybooksExplorerProps {
  playbooks: PlaybookItem[];
  lang: 'pt' | 'en';
  onSelectPlaybookInCopilot?: (playbook: PlaybookItem) => void;
}

export const PlaybooksExplorer: React.FC<PlaybooksExplorerProps> = ({
  playbooks,
  lang,
  onSelectPlaybookInCopilot,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookItem>(playbooks[1] || playbooks[0]);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);

  const filteredPlaybooks = playbooks.filter((pb) => {
    const q = searchQuery.toLowerCase();
    return (
      pb.titulo.toLowerCase().includes(q) ||
      pb.arquivo.toLowerCase().includes(q) ||
      pb.tags.some((t) => t.toLowerCase().includes(q)) ||
      pb.erros_ora.some((e) => e.toLowerCase().includes(q))
    );
  });

  const handleCopy = (sqlKey: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSql(sqlKey);
    setTimeout(() => setCopiedSql(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">
                  Base de Conhecimento Operacional (43 Playbooks)
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Homologados para RAC & Exadata
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Cada playbook padroniza o roteiro técnico do incidente com gestão de risco explícita (<span className="text-emerald-400">Leitura</span>, <span className="text-amber-400">Mudança</span>, <span className="text-rose-400">Destrutivo</span>), o que olhar nos resultados e armadilhas clássicas.
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-emerald-400 font-bold">350+ Passos Curados</div>
            <div className="text-[11px] text-slate-400">Zero DDL Inseguro</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Playbooks List (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por erro (ex: ORA-00060, ORA-01555) ou tag..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredPlaybooks.map((pb) => {
              const isSelected = selectedPlaybook.arquivo === pb.arquivo;
              return (
                <button
                  key={pb.arquivo}
                  onClick={() => setSelectedPlaybook(pb)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      {pb.arquivo}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {pb.passos_count} passos
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    {pb.titulo}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {pb.quando_usar}
                  </p>

                  {pb.erros_ora.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pb.erros_ora.map((err) => (
                        <span
                          key={err}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold"
                        >
                          {err}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Playbook Detailed Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-500 font-bold">
                  {selectedPlaybook.arquivo}
                </span>
                {onSelectPlaybookInCopilot && (
                  <button
                    onClick={() => onSelectPlaybookInCopilot(selectedPlaybook)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Iniciar no Copiloto IA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {selectedPlaybook.titulo}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                <strong>Quando Usar:</strong> {selectedPlaybook.quando_usar}
              </p>
            </div>

            {/* Standardized Steps */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Roteiro de Investigação Padronizado
              </h3>

              {/* Sample standard step 1 */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    1. Identificar Sessões Ofensoras e Tempo de Espera
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                    Risco: Leitura
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong>Objetivo:</strong> Mapear quem está gerando a carga e se há sessões enfileiradas esperando por recursos exclusivos.
                </p>
                <div className="relative p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto select-all">
                  <pre>{`SELECT inst_id, sid, serial#, username, status,
       event, seconds_in_wait, sql_id, blocking_session, machine
FROM gv$session
WHERE status = 'ACTIVE' AND wait_class != 'Idle'
ORDER BY seconds_in_wait DESC;`}</pre>
                  <button
                    onClick={() =>
                      handleCopy('step1', "SELECT inst_id, sid, serial#, username, status, event, seconds_in_wait FROM gv$session WHERE status = 'ACTIVE';")
                    }
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] flex items-center gap-1"
                  >
                    {copiedSql === 'step1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">👁️ O que olhar:</span>
                    <p className="text-slate-600 dark:text-slate-400">seconds_in_wait alto e estável indica travamento real.</p>
                  </div>
                  <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">⚠️ Armadilha clássica:</span>
                    <p className="text-amber-700 dark:text-amber-400">Usar V$SESSION em RAC esconde nós remotos.</p>
                  </div>
                </div>
              </div>

              {/* Sample standard step 2 */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    2. Avaliar Impacto de Rollback no Undo
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                    Risco: Leitura
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong>Objetivo:</strong> Saber quantos blocos foram alterados antes de qualquer decisão drástica.
                </p>
                <div className="relative p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto select-all">
                  <pre>{`SELECT s.inst_id, s.sid, s.serial#, s.username,
       t.used_ublk AS blocos_undo, t.used_urec AS registros_undo
FROM gv$transaction t
JOIN gv$session s ON s.saddr = t.ses_addr AND s.inst_id = t.inst_id;`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
