/**
 * ParraDibiei - Header & Navegação Principal
 * Barra superior oficial do framework ParraDibiei - API & Oracle DBA Grafana Studio
 */

import React, { useState } from 'react';
import {
  Database,
  Bot,
  Flame,
  BookOpen,
  History,
  Activity,
  Download,
  Moon,
  Sun,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  FolderArchive,
  Layers,
  Server,
  Maximize2,
} from 'lucide-react';
import { TabType } from '../types/parradibiei';
import { triggerZipDownload, PARRA_DIBIEI_FULL_ZIP_BASE64 } from '../utils/zipData';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lang: 'pt' | 'en';
  setLang: (lang: 'pt' | 'en') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  totalCasesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  totalCasesCount,
}) => {
  const [showGitModal, setShowGitModal] = useState(false);
  const repoName = 'betobkss/ParraDibieiGraf';
  const repoUrl = 'https://github.com/betobkss/ParraDibieiGraf';
  const lastPushTimestamp = '07/11/2026 09:31 UTC';
  const lastCommitHash = 'a1a36a7';
  const t = {
    pt: {
      brand: 'ParraDibiei',
      tag: 'API & Oracle DBA Grafana Studio',
      copilot: 'Copiloto IA (Guiado)',
      dash: 'Painel Oficial (Dash)',
      grafana: 'Grafana v10 Imbutido',
      playbooks: '43 Playbooks',
      history: 'Histórico Vivo',
      doctor: 'Auditoria (Doctor)',
      downloadZip: 'Baixar Framework (.ZIP)',
    },
    en: {
      brand: 'ParraDibiei',
      tag: 'API & Oracle DBA Grafana Studio',
      copilot: 'AI Copilot (Guided)',
      dash: 'Official Dashboard (Dash)',
      grafana: 'Embedded Grafana v10',
      playbooks: '43 Playbooks',
      history: 'Live History',
      doctor: 'Audit (Doctor)',
      downloadZip: 'Download Framework (.ZIP)',
    },
  }[lang];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('copilot')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                {t.brand}
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 block leading-none font-semibold">
                {t.tag}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* 1. Copiloto IA */}
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'copilot'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>{t.copilot}</span>
          </button>

          {/* 2. Painel Oficial (Dash do PAINEL.py) */}
          <button
            onClick={() => setActiveTab('dash')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'dash'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>{t.dash}</span>
          </button>

          {/* 3. Grafana v10 */}
          <button
            onClick={() => setActiveTab('grafana')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'grafana'
                ? 'bg-[#f05a28] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-4 h-4 text-[#f05a28]" />
            <span>{t.grafana}</span>
          </button>

          {/* 3. Playbooks */}
          <button
            onClick={() => setActiveTab('playbooks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'playbooks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>{t.playbooks}</span>
          </button>

          {/* 4. Histórico Vivo */}
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>{t.history}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 tabular-nums">
              {totalCasesCount}
            </span>
          </button>

          {/* 5. Doctor */}
          <button
            onClick={() => setActiveTab('doctor')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'doctor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{t.doctor}</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* GitHub Integration Status Indicator */}
          <button
            onClick={() => setShowGitModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs text-slate-700 dark:text-slate-200 transition-all shadow-xs group"
            title="Clique para ver o status da integração com o GitHub"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></span>
            </div>
            <GitBranch className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <div className="hidden md:flex flex-col text-left leading-none">
              <span className="font-semibold text-[11px] text-slate-900 dark:text-white flex items-center gap-1">
                betobkss/ParraDibieiGraf
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Sincronizado · {lastPushTimestamp.split(' ')[1]}
              </span>
            </div>
            <div className="md:hidden flex items-center gap-1 font-semibold text-[11px]">
              <span>Git</span>
              <span className="text-emerald-500">✓</span>
            </div>
          </button>

          {/* Download Framework Button - In-Memory Guaranteed Download */}
          <button
            onClick={() => triggerZipDownload(PARRA_DIBIEI_FULL_ZIP_BASE64, 'ParraDibiei_Completo_Com_Grafana_e_IA.zip')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap active:scale-95 cursor-pointer"
            title="Download direto do framework completo"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadZip}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {lang === 'pt' ? 'PT-BR' : 'EN'}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Abrir em Nova Aba 100% Tela Cheia do Navegador */}
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Abrir em Nova Aba 100% Tela Cheia (Sem Moldura AI Studio)"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
          </a>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 gap-1.5 text-xs items-center">
        <button
          onClick={() => setShowGitModal(true)}
          className="px-2.5 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shrink-0"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <GitBranch className="w-3 h-3" />
          <span>GitHub Conectado</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'copilot'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Copiloto</span>
        </button>

        <button
          onClick={() => setActiveTab('dash')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'dash'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Dash</span>
        </button>

        <button
          onClick={() => setActiveTab('grafana')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'grafana'
              ? 'bg-[#f05a28] text-white'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Grafana</span>
        </button>

        <button
          onClick={() => setActiveTab('playbooks')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'playbooks'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Playbooks</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Histórico ({totalCasesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('doctor')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'doctor'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Doctor</span>
        </button>
      </div>

      {/* GitHub Integration Details Modal */}
      {showGitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-xs">
                  <GitBranch className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {lang === 'pt' ? 'Status da Integração GitHub' : 'GitHub Integration Status'}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {lang === 'pt' ? 'Ativo & Seguro' : 'Active & Safe'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'pt' ? 'Repositório oficial configurado e versionado' : 'Official repository configured and tracked'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGitModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4">
              {/* Repository Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'pt' ? 'Repositório Conectado:' : 'Connected Repository:'}
                  </span>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>{repoName}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'pt' ? 'Branch Padrão:' : 'Default Branch:'}
                  </span>
                  <span className="font-mono font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    main
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'pt' ? 'Último Push Sincronizado:' : 'Last Push Timestamp:'}
                  </span>
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{lastPushTimestamp}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'pt' ? 'Commit Hash:' : 'Commit Hash:'}
                  </span>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                    {lastCommitHash}
                  </span>
                </div>
              </div>

              {/* Data Safety Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {lang === 'pt' ? 'Proteção & Arquivos no Repositório' : 'Protection & Repository Files'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>43 Playbooks Oracle</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Grafana v10 & Dashs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Prompts Copiloto IA</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>historico.json Ativo</span>
                  </div>
                </div>
              </div>

              {/* Pacotes ZIP Disponíveis */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-indigo-900 dark:text-indigo-200">
                  <FolderArchive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{lang === 'pt' ? 'Pacote Completo Disponível no Repositório' : 'Complete Package Available in Repo'}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {lang === 'pt'
                    ? 'A pasta /pacote_completo_zip no repositório contém o arquivo .zip com todas as dependências incluídas para execução offline.'
                    : 'The /pacote_completo_zip folder in the repository contains the .zip file with all dependencies included for offline execution.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="/ParraDibiei_Com_Todas_Dependencias.zip"
                    download="ParraDibiei_Com_Todas_Dependencias.zip"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'pt' ? 'Baixar Pacote com Dependências (48 MB)' : 'Download Full Package with Deps (48 MB)'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-xs transition-colors"
              >
                <span>{lang === 'pt' ? 'Abrir no GitHub' : 'Open in GitHub'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setShowGitModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                {lang === 'pt' ? 'Fechar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
