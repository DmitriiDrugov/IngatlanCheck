import type { Locale } from './i18n';

export type ReportStatus = 'processing' | 'completed' | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FlagSeverity = 'red' | 'yellow' | 'green';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface Owner {
  name: string | null;
  ownership_share: string | null;
  acquisition_date: string | null;
  acquisition_title: string | null;
}

export interface PropertyInfo {
  cim: string | null;
  helyrajzi_szam: string | null;
  terulet: string | null;
  megnevezes: string | null;
}

export interface AnalysisFlag {
  id: string;
  severity: FlagSeverity;
  category: string;
  title: string;
  description: string;
  evidence_excerpt: string;
  source_section: string | null;
  confidence: ConfidenceLevel;
  recommendation: string;
}

export interface DocumentStats {
  character_count: number;
  word_count: number;
  line_count: number;
  detected_sections: string[];
  flags_total: number;
  flags_red: number;
  flags_yellow: number;
  flags_green: number;
  owners_count: number;
  processing_ms: number;
}

export interface AnalysisResult {
  document_quality: {
    readable: boolean;
    notes: string | null;
  };
  ingatlan: PropertyInfo;
  tulajdonosok: Owner[];
  flags: AnalysisFlag[];
  risk_score: RiskLevel;
  summary: string;
  stats: DocumentStats;
}

export interface Report {
  id: string;
  locale: Locale;
  status: ReportStatus;
  analysis: AnalysisResult | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface GlobalStats {
  reports_total: number;
  reports_completed: number;
  reports_failed: number;
  flags_total: number;
  flags_red: number;
  flags_yellow: number;
  flags_green: number;
  risk_distribution: Record<RiskLevel, number>;
  top_flag_categories: Array<{ category: string; count: number }>;
  average_processing_ms: number;
  last_updated: string | null;
}
