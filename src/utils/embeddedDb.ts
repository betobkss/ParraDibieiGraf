/**
 * ParraDibiei - Unified Embedded Database Engine
 * 
 * Centraliza e sincroniza em base de dados embutida (IndexedDB + LocalStorage):
 * 1. Histórico de Incidentes e RCA (historico.json)
 * 2. Backlog de Melhoria Contínua (gerado a partir dos RCAs e MELHORIA.py)
 * 3. Registros de Health Check e Validação EML (13 imagens / 8 seções de contenção)
 * 4. Alimentação em tempo real para as métricas dos Dashboards do Grafana v10
 */

import {
  HistoryData,
  IncidentCase,
  MelhoriaItem,
  HealthCheckRecord,
  UnifiedEmbeddedDatabase,
} from '../types/parradibiei';
import {
  INITIAL_HISTORY,
  INITIAL_MELHORIAS,
  INITIAL_HEALTHCHECKS,
  INITIAL_UNIFIED_DB,
} from '../data/parradibieiData';

const DB_NAME = 'ParraDibiei_Unified_DB';
const DB_VERSION = 2;
const STORE_NAME = 'unified_store';
const LOCALSTORAGE_KEY = 'parradibiei_unified_db';
const BACKUP_KEY = 'parradibiei_unified_backup_v3';

class EmbeddedFrameworkDB {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  /**
   * Inicializa a base embutida IndexedDB
   */
  async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('[ParraDibiei DB] IndexedDB indisponível. Operando via LocalStorage.');
        this.isInitialized = true;
        resolve();
        return;
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event: Event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.isInitialized = true;
          resolve();
        };

        request.onerror = (e) => {
          console.warn('[ParraDibiei DB] Falha ao abrir IndexedDB, usando fallback:', e);
          this.isInitialized = true;
          resolve();
        };
      } catch (err) {
        console.warn('[ParraDibiei DB] Erro de inicialização:', err);
        this.isInitialized = true;
        resolve();
      }
    });
  }

  /**
   * Carrega todos os dados da base unificada (Síncrono do LocalStorage com fallback)
   */
  getUnifiedData(): UnifiedEmbeddedDatabase {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY) || localStorage.getItem(BACKUP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.casos)) {
          return {
            versao: parsed.versao || INITIAL_UNIFIED_DB.versao,
            atualizado_em: parsed.atualizado_em || new Date().toISOString(),
            banco: parsed.banco || INITIAL_UNIFIED_DB.banco,
            casos: parsed.casos || INITIAL_HISTORY.casos,
            melhorias: Array.isArray(parsed.melhorias) ? parsed.melhorias : INITIAL_MELHORIAS,
            healthchecks: Array.isArray(parsed.healthchecks) ? parsed.healthchecks : INITIAL_HEALTHCHECKS,
          };
        }
      }
    } catch (e) {
      console.warn('[ParraDibiei DB] Erro ao carregar dados unificados:', e);
    }
    return INITIAL_UNIFIED_DB;
  }

  /**
   * Salva o estado completo unificado em LocalStorage e IndexedDB
   */
  async saveUnifiedData(data: UnifiedEmbeddedDatabase): Promise<boolean> {
    try {
      const payload = JSON.stringify(data);
      localStorage.setItem(LOCALSTORAGE_KEY, payload);
      localStorage.setItem(BACKUP_KEY, payload);

      if (!this.db) await this.init();
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ id: 'primary_unified_payload', ...data, lastPersisted: Date.now() });
      }

      return true;
    } catch (err) {
      console.error('[ParraDibiei DB] Erro ao persistir dados unificados:', err);
      return false;
    }
  }

  /**
   * Adiciona um novo incidente resolvido e gera automaticamente uma ação preventiva
   * no backlog de melhoria contínua (conforme a filosofia do MELHORIA.py)
   */
  async addCaso(newCase: IncidentCase): Promise<UnifiedEmbeddedDatabase> {
    const current = this.getUnifiedData();
    const updatedCasos = [newCase, ...current.casos];

    // Gera automaticamente uma recomendação de Melhoria Contínua baseada no RCA
    const novaMelhoria: MelhoriaItem = {
      id: `MELH_${Date.now().toString().slice(-6)}`,
      caso_origem_id: newCase.id,
      titulo: `Ação Preventiva: ${newCase.titulo.replace('Contenção de Linha (Enq: TX)', 'Eliminação de Bloqueio')}`,
      categoria: newCase.titulo.includes('FRA')
        ? 'Backup'
        : newCase.titulo.includes('1555')
        ? 'Banco'
        : 'Aplicacao',
      prioridade: newCase.severidade === 'CRITICAL' ? 'P1 - Alta' : 'P2 - Media',
      status: 'PENDENTE',
      acao_preventiva: newCase.acao_tomada || 'Auditar parâmetros do subsistema afetado para evitar recorrência.',
      ganho_resiliencia: 'Garante disponibilidade ininterrupta do serviço crítico sem atuação manual reativa.',
      data_criacao: new Date().toISOString().slice(0, 10),
    };

    const updatedMelhorias = [novaMelhoria, ...current.melhorias];

    const updated: UnifiedEmbeddedDatabase = {
      ...current,
      atualizado_em: new Date().toISOString(),
      casos: updatedCasos,
      melhorias: updatedMelhorias,
    };

    await this.saveUnifiedData(updated);
    return updated;
  }

  /**
   * Adiciona um novo registro de Health Check
   */
  async addHealthCheck(hc: HealthCheckRecord): Promise<UnifiedEmbeddedDatabase> {
    const current = this.getUnifiedData();
    const updated: UnifiedEmbeddedDatabase = {
      ...current,
      atualizado_em: new Date().toISOString(),
      healthchecks: [hc, ...current.healthchecks],
    };
    await this.saveUnifiedData(updated);
    return updated;
  }

  /**
   * Calcula métricas agregadas dinâmicas para os painéis do Grafana
   */
  getGrafanaLiveMetrics() {
    const data = this.getUnifiedData();
    const totalCasos = data.casos.length;
    const resolvidos = data.casos.filter((c) => c.status === 'RESOLVIDO').length;
    const taxaResolucao = totalCasos > 0 ? Math.round((resolvidos / totalCasos) * 100) : 100;

    // Health Score médio pós-resolução
    const mediaHealthScore =
      data.healthchecks.length > 0
        ? data.healthchecks[0].score
        : totalCasos > 0
        ? Math.round(data.casos.reduce((acc, c) => acc + c.health_score_final, 0) / totalCasos)
        : 95;

    // Itens de melhoria
    const melhoriasPendentes = data.melhorias.filter((m) => m.status === 'PENDENTE').length;
    const melhoriasImplementadas = data.melhorias.filter((m) => m.status === 'IMPLEMENTADA').length;

    // Relatórios de Health Check
    const ultimosHC = data.healthchecks.slice(0, 5);

    return {
      totalCasos,
      taxaResolucao,
      mediaHealthScore,
      melhoriasPendentes,
      melhoriasImplementadas,
      totalMelhorias: data.melhorias.length,
      ultimosHC,
      casosRecentes: data.casos.slice(0, 5),
      melhoriasRecentes: data.melhorias.slice(0, 5),
    };
  }

  /**
   * Compatibilidade com versão anterior (loadSync para HistoryData)
   */
  loadSync(): HistoryData {
    const unified = this.getUnifiedData();
    return {
      versao: unified.versao,
      atualizado_em: unified.atualizado_em,
      banco: unified.banco,
      casos_totais: unified.casos.length,
      taxa_resolucao_pct: 100.0,
      casos: unified.casos,
    };
  }

  /**
   * Compatibilidade com autoSave do App.tsx
   */
  async autoSave(history: HistoryData): Promise<boolean> {
    const current = this.getUnifiedData();
    const updated: UnifiedEmbeddedDatabase = {
      ...current,
      atualizado_em: history.atualizado_em,
      casos: history.casos,
    };
    return this.saveUnifiedData(updated);
  }

  /**
   * Exporta a base de dados unificada completa (parradibiei_unified_db.json)
   */
  downloadUnifiedDB(): void {
    try {
      const data = this.getUnifiedData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'parradibiei_unified_db.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error('[ParraDibiei DB] Falha ao exportar unified_db:', err);
    }
  }

  /**
   * Baixa o historico.json oficial
   */
  downloadHistoricoJSON(data: HistoryData): void {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historico.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error('[ParraDibiei DB] Falha ao exportar historico.json:', err);
    }
  }
}

export const embeddedDB = new EmbeddedFrameworkDB();
