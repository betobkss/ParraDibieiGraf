/**
 * ParraDibiei - Embedded Database Engine para Histórico de Incidentes
 * 
 * Fornece persistência em camada dupla:
 * 1. IndexedDB nativo (armazenamento de alto desempenho no navegador)
 * 2. LocalStorage (fallback instantâneo e espelhamento)
 * 3. Exportador e validador JSON compatível com o historico.json do repositório
 */

import { HistoryData, IncidentCase } from '../types/parradibiei';
import { INITIAL_HISTORY } from '../data/parradibieiData';

const DB_NAME = 'ParraDibiei_Embedded_DB';
const DB_VERSION = 1;
const STORE_NAME = 'incident_history';
const LOCALSTORAGE_KEY = 'parradibiei_history_data';
const BACKUP_KEY = 'parradibiei_history_backup_v2';

class EmbeddedHistoryDB {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  /**
   * Inicializa o banco de dados IndexedDB
   */
  async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('[ParraDibiei DB] IndexedDB não suportado. Operando via LocalStorage.');
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
   * Salva o histórico completo em LocalStorage e IndexedDB (Auto-Save)
   */
  async autoSave(data: HistoryData): Promise<boolean> {
    try {
      // 1. Salva no LocalStorage primário e backup
      const payload = JSON.stringify(data);
      localStorage.setItem(LOCALSTORAGE_KEY, payload);
      localStorage.setItem(BACKUP_KEY, payload);

      // 2. Salva no IndexedDB se disponível
      if (!this.db) await this.init();
      if (this.db) {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ id: 'current_history', ...data, lastSaved: Date.now() });
      }

      return true;
    } catch (err) {
      console.error('[ParraDibiei DB] Erro no Auto-Save:', err);
      return false;
    }
  }

  /**
   * Carrega o histórico salvo (do LocalStorage ou IndexedDB)
   */
  loadSync(): HistoryData {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY) || localStorage.getItem(BACKUP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.casos)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[ParraDibiei DB] Erro ao carregar síncrono:', e);
    }
    return INITIAL_HISTORY;
  }

  /**
   * Baixa o arquivo historico.json atualizado em formato JSON oficial
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

export const embeddedDB = new EmbeddedHistoryDB();
