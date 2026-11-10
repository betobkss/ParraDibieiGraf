/**
 * ParraDibiei - Tipos e Modelos de Dados Oficiais
 * Framework de Troubleshooting, Observabilidade e RCA para Oracle DBA
 * 
 * Este arquivo centraliza todas as tipagens da aplicação para fácil manutenção.
 */

export type TabType = 'copilot' | 'dash' | 'grafana' | 'playbooks' | 'history' | 'doctor';

export type RiskLevel = 'leitura' | 'mudanca' | 'destrutivo';

export interface PlaybookStep {
  titulo: string;
  objetivo: string;
  risco: RiskLevel;
  comando: string;
  olhar: string;
  armadilha?: string;
  mockOutput?: string;
}

export interface PlaybookItem {
  arquivo: string;
  titulo: string;
  quando_usar: string;
  erros_ora: string[];
  tags: string[];
  passos_count: number;
  passos?: PlaybookStep[];
}

export interface IncidentCase {
  id: string;
  titulo: string;
  data: string;
  playbook_usado: string;
  severidade: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'RESOLVIDO' | 'EM_ANALISE' | 'MITIGADO';
  health_score_inicial: number;
  health_score_final: number;
  causa_raiz: string;
  acao_tomada: string;
  autor: string;
  arquivos: string[];
}

export interface HistoryData {
  versao: string;
  atualizado_em: string;
  banco: string;
  casos_totais: number;
  taxa_resolucao_pct: number;
  casos: IncidentCase[];
}

export interface WaitClassMetric {
  name: string;
  pct: number;
  color: string;
}

export interface TablespaceMetric {
  name: string;
  usedPct: number;
  freeGb: number;
  status: 'ok' | 'warn' | 'crit';
}
