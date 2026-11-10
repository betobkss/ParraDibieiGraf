import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Server,
  Terminal,
  Lock,
  RefreshCw,
  FileCheck2,
  AlertTriangle,
  FileCode,
  Image,
  Clock,
  Layers,
  ArrowRight,
  Download,
  Copy,
  Check,
} from 'lucide-react';

interface DoctorViewerProps {
  lang: 'pt' | 'en';
}

export const DoctorViewer: React.FC<DoctorViewerProps> = ({ lang }) => {
  const [activeSubTab, setActiveSubTab] = useState<'doctor' | 'eml_validator' | 'gravity_spec'>('doctor');
  const [simulatedReportType, setSimulatedReportType] = useState<'healthcheck' | 'contencao'>('contencao');
  const [isFinalMode, setIsFinalMode] = useState<boolean>(false);
  const [hasCopiedCli, setHasCopiedCli] = useState(false);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Auditoria, Doctor & Validador de Contratos (.EML)
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Diagnóstico estático offline do framework e conformidade contratual de relatórios corporativos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-700/60 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('doctor')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'doctor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>1. Doctor CLI</span>
            </button>
            <button
              onClick={() => setActiveSubTab('eml_validator')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'eml_validator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>2. Validador .EML</span>
            </button>
            <button
              onClick={() => setActiveSubTab('gravity_spec')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === 'gravity_spec'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Contenção Gravity</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: DOCTOR CLI */}
      {activeSubTab === 'doctor' && (
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
  [OK   ] Validador de Relatórios  troubleshoot.relatorio ativo (7/7 testes)
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
      )}

      {/* SUBTAB 2: VALIDADOR .EML */}
      {activeSubTab === 'eml_validator' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-500" />
                  <span>Simulador de Validação de Contrato EML (Offline)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Audita a integridade de CIDs, total de imagens, coerência de timestamp e ausência de tags não suportadas.
                </p>
              </div>

              {/* Switches */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setSimulatedReportType('contencao')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      simulatedReportType === 'contencao'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Contenção (8 Seções)
                  </button>
                  <button
                    onClick={() => setSimulatedReportType('healthcheck')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      simulatedReportType === 'healthcheck'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Health Check (13 Imagens)
                  </button>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isFinalMode}
                    onChange={(e) => setIsFinalMode(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Modo Final (--final)</span>
                </label>
              </div>
            </div>

            {/* Validation Results Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 block text-[11px]">Tipo de Relatório</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                  {simulatedReportType}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 block text-[11px]">Imagens Obrigatórias</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {simulatedReportType === 'contencao' ? '8 Imagens (2.1 a 2.8)' : '13 Imagens (i0 a i12)'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 block text-[11px]">CIDs Quebrados</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  0 (100% íntegros)
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500 block text-[11px]">Status Contratual</span>
                <span className={`text-sm font-bold ${isFinalMode ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {isFinalMode ? 'Pendente: Remover RASCUNHO' : 'Válido em Modo Rascunho'}
                </span>
              </div>
            </div>

            {/* CLI Execution Command Box */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Comando CLI Oficial do Validador:
              </span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>
                  python3 VALIDAR_RELATORIO.py {isFinalMode ? '--final ' : ''}relatorio_contencao.eml
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `python3 VALIDAR_RELATORIO.py ${isFinalMode ? '--final ' : ''}relatorio_contencao.eml`
                    );
                    setHasCopiedCli(true);
                    setTimeout(() => setHasCopiedCli(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 transition-all"
                >
                  {hasCopiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{hasCopiedCli ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Test Suite Summary */}
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Bateria de Testes Automatizados (pytest / tests/test_relatorio.py)</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 1. Health check válido com 13 imagens e janela coerente
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 2. Detecção de horário divergente no cabeçalho
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 3. Isolamento estrito entre Health Check e Contenção
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 4. Bloqueio impeditivo para contagem diferente de 13 imagens
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 5. Contenção exige evidência nas 8 seções (2.1 a 2.8)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 6. Detecção de selo RASCUNHO em modo final
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span> 7. Bloqueio imediato para CIDs sem anexo binário
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: GRAVITY ESPECIFICAÇÃO DE CONTENÇÃO */}
      {activeSubTab === 'gravity_spec' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <span>Protocolo de Contenção Gravity (OECB1RET)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                8 Seções Analíticas Obrigatórias com correlação AWR Global, ASH e JOB_BLOQUEOS_ASH.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              Protocolo S00-S14
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>2.1 a 2.4: Diagnóstico Global AWR</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Escopo completo com snaps ini/fim, distribuição percentual de classes de espera (% DB CPU, Application, Cluster), Top 5 eventos de espera e Top SQL ordenados por elapsed time.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>2.5: JOB_BLOQUEOS_ASH (S14a)</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Histograma de 10 em 10 minutos medindo persistência temporal (sessão × minuto), cruzado com tabela Top 5 de <code>Evento | Objeto</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>2.6 e 2.7: Série Temporal & SQL Ofensor</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Mapeamento do primeiro dia de degradação via coleta S07 e medição de milissegundos por execução para o mesmo <code>PLAN_HASH_VALUE</code> (coleta S11).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">4</span>
                <span>2.8: Mecanismo, Patches & Cache</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Plano com seção Note, status no <code>DBA_SQL_PATCHES</code> (S12) e parâmetros de Result Cache (S13). <strong>Proibido uso de tag &lt;pre&gt;</strong> no e-mail corporativo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

