export type ReportStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FlagSeverity = 'red' | 'yellow' | 'green';

export interface Flag {
  id: string;
  severity: FlagSeverity;
  category: string;
  title_hu: string;
  description_hu: string;
  raw_text: string;
  recommendation_hu: string;
}

export interface AnalysisResult {
  tulajdonos: Array<{
    name: string;
    ownership_share: string;
    acquisition_date: string;
    acquisition_title: string;
  }>;
  ingatlan: {
    cim: string;
    helyrajzi_szam: string;
    terulet: string;
    megnevezes: string;
  };
  flags: Flag[];
  risk_score: RiskLevel;
  summary_hu: string;
}

export interface Report {
  id: string;
  email: string | null;
  status: ReportStatus;
  analysis: AnalysisResult | null;
  flags: Flag[];
  risk_score: RiskLevel | null;
  summary: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
