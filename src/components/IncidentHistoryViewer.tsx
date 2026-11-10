import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Calendar,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronUp,
  FileCode,
  Terminal,
} from 'lucide-react';
import { IncidentCase, HistoryData } from '../types/parradibiei';

interface IncidentHistoryViewerProps {
  historyData: HistoryData;
  lang: 'pt' | 'en';
  onSelectCase?: (caseItem: IncidentCase) => void;
}

export const IncidentHistoryViewer: React.FC<IncidentHistoryViewerProps> = ({
  historyData,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(historyData.casos[0]?.id || null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredCases = historyData.casos.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.id.toLowerCase().includes(q) ||
      c.titulo.toLowerCase().includes(q) ||
      c.causa_raiz.toLowerCase().includes(q) ||
      c.playbook_usado.toLowerCase().includes(q);

    const matchesSeverity = filterSeverity === 'ALL' || c.severidade === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const downloadReport = (caseItem: IncidentCase) => {
    const content = `# RELATÓRIO EXECUTIVO DE CAUSA RAIZ (RCA) - PARRADIBIEI
**ID do Caso:** ${caseItem.id}
**Título do Incidente:** ${caseItem.titulo}
**Data do Evento:** ${caseItem.data}
**Playbook Homologado:** ${caseItem.playbook_usado}
**Severidade:** ${caseItem.severidade}
**Status:** ${caseItem.status}
**Evolução do Health Score:** ${caseItem.health_score_inicial} -> ${caseItem.health_score_final}
**Responsáveis:** ${caseItem.autor}

---

## 1. Causa Raiz Identificada (Root Cause)
${caseItem.causa_raiz}

## 2. Ação Imediata & Mitigação Realizada
${caseItem.acao_tomada}

## 3. Garantia Operacional
- Investigação conduzida estritamente em modo READ-ONLY (SET TRANSACTION READ ONLY).
- Nenhuma view de Diagnostics Pack foi consultada sem licenciamento prévio.
- Histórico registrado automaticamente em historico.json para melhoria contínua da equipe.
`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${caseItem.id}_relatorio.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">
                  Histórico Vivo de Incidentes (`historico.json`)
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  {historyData.banco}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Toda investigação conduzida pelo Copiloto IA ou pelo script de CLI grava registros estruturados em <code className="font-mono text-emerald-300">troubleshooting/&lt;CASO&gt;</code> e atualiza este catálogo central para auditoria e lições aprendidas.
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-emerald-400 font-bold">
              {historyData.taxa_resolucao_pct}% Taxa de Resolução
            </div>
            <div className="text-[11px] text-slate-400">
              {historyData.casos.length} Incidentes Documentados
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Total de Casos</span>
            <span className="text-xl font-bold font-mono text-white">{historyData.casos.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Taxa de Sucesso</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{historyData.taxa_resolucao_pct}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Recuperação de Saúde</span>
            <span className="text-xl font-bold font-mono text-indigo-400">+31.2 pts</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Regra Inviolável</span>
            <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1 mt-1">
              <Shield className="w-3.5 h-3.5" /> 100% Read-Only
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID do caso, palavra-chave, erro ou playbook..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0 font-medium text-[11px]">Severidade:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 ${
                filterSeverity === sev
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sev === 'ALL' ? 'Todos' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Cases Accordion List */}
      <div className="space-y-3">
        {filteredCases.map((c) => {
          const isExpanded = expandedCaseId === c.id;
          return (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all"
            >
              {/* Header clickable summary */}
              <button
                onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                className="w-full p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 sm:mt-0 shrink-0 ${
                      c.severidade === 'CRITICAL'
                        ? 'bg-rose-500 shadow-md shadow-rose-950 animate-pulse'
                        : c.severidade === 'HIGH'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-500 dark:text-slate-400">
                        {c.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          c.severidade === 'CRITICAL'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            : c.severidade === 'HIGH'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {c.severidade}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                        {c.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {c.titulo}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right text-xs">
                    <span className="text-[11px] text-slate-400 block font-mono">{c.data}</span>
                    <span className="text-xs font-mono text-emerald-500 font-bold">
                      Health: {c.health_score_inicial} → {c.health_score_final}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Detailed RCA View */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Causa Raiz */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="font-bold text-rose-500 uppercase text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Causa Raiz Identificada (RCA):
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {c.causa_raiz}
                      </p>
                    </div>

                    {/* Ação Tomada */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="font-bold text-emerald-500 uppercase text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ação Corretiva Executada:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {c.acao_tomada}
                      </p>
                    </div>
                  </div>

                  {/* Meta Details Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span><strong>Playbook:</strong> {c.playbook_usado}</span>
                      <span>·</span>
                      <span><strong>Investigador:</strong> {c.autor}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadReport(c)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar Relatório RCA (.MD)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
