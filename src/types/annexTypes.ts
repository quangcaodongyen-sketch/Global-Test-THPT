export interface AnnexIntegrationItem {
  id: string;
  subject: string;
  grade: string;
  lesson_title: string;
  nls_content?: string;
  ai_content?: string;
  stem_content?: string;
  anqp_content?: string;
  qcn_content?: string;
  xbhtlh_content?: string;
  bvmt_content?: string;
  gdtc_content?: string;
  gddp_content?: string;
  integrations?: Record<string, string>;
  activity_action?: string;
  product_action?: string;
  warmup_gv?: string;
  warmup_hs?: string;
  warmup_prod?: string;
  discovery_gv?: string;
  discovery_hs?: string;
  discovery_prod?: string;
  practice_gv?: string;
  practice_hs?: string;
  practice_prod?: string;
  application_gv?: string;
  application_hs?: string;
  application_prod?: string;
  created_at?: string;
}

export type IntegrationMode = 'exact' | 'deep_analysis';

export interface PedagogicalAnalysisResult {
  subject: string;
  grade: string;
  lesson_title: string;
  objectives_list: string[];
  warmup_gv: string;
  warmup_hs: string;
  warmup_prod: string;
  discovery_gv: string;
  discovery_hs: string;
  discovery_prod: string;
  practice_gv: string;
  practice_hs: string;
  practice_prod: string;
  application_gv: string;
  application_hs: string;
  application_prod: string;
  code_tag?: string;
  is_english?: boolean;
}

export interface ProcessingLog {
  timestamp: string;
  step: number;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}
