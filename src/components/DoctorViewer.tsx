import React from 'react';
import { Activity, ShieldCheck, CheckCircle2, Cpu, Server, Terminal, Lock, RefreshCw } from 'lucide-react';

interface DoctorViewerProps {
  lang: 'pt' | 'en';
}

export const DoctorViewer: React.FC<DoctorViewerProps> = ({ lang }) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Diagnóstico do Framework (`troubleshoot.doctor`)
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Validação estrita de compatibilidade com ambientes corporativos (RHEL 9 / Ubuntu 22 / Oracle Linux 9).
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span>Resultado da Execução: python3 -m troubleshoot.doctor</span>
          </h2>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
            100% Homologado
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto select-all">
          <pre className="leading-relaxed">{`======================================================================
  PARRADIBIEI DOCTOR - Diagnóstico da Instalação e Requisitos
======================================================================
  [OK   ] Versão do Python         Python 3.10 / 3.11 / 3.12 suportado
  [OK   ] Catálogo MCP             84 checks read-only validados
  [OK   ] Base de conhecimento     43 playbooks / 350 passos validados
  [OK   ] Isolamento de Senha      Nenhuma credencial gravada em disco
  [OK   ] Permissão de Escrita     troubleshooting/ e historico.json OK
  [OK   ] Orquestrador             TROUBLESHOOT.py e HISTORICO.py ativos
  [OK   ] Observabilidade          Stack Grafana v10 + Prometheus pronta
----------------------------------------------------------------------
  Status: PRONTO PARA USO EM PRODUÇÃO, RAC E AUDITORIA CORPORATIVA`}</pre>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">1. Read-Only Inviolável</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Toda investigação utiliza <code className="font-mono text-emerald-500">SET TRANSACTION READ ONLY</code> e identifica a sessão com <code className="font-mono">MODULE=TROUBLESHOOT-RO</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">2. License-Aware (Pack Guard)</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Verifica <code className="font-mono">CONTROL_MANAGEMENT_PACK_ACCESS</code> para jamais consultar views de Diagnostics Pack sem licença do cliente.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <Server className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">3. Topologia RAC & Exadata</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Sintaxe 100% compatível com instâncias múltiplas via <code className="font-mono">GV$</code> e detecção automática de storage cells e offload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
