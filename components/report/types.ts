// Shapes match exactly what /api/analyze emits (SCHEMA in app/api/analyze/route.ts).
// Driver + overall scores are 0–10 from the engine; the UI displays them ×10 on a 0–100 scale.
// Sub-KPIs are already 0–100 with RAG status.

export interface SubKpi {
  name: string;
  score: number; // 0–100
  status: 'green' | 'amber' | 'red';
  verdict: string;
  evidence?: string;
}

export interface Recommendation {
  priority: 'Critical' | 'High' | 'Medium';
  action: string;
  rationale: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface Driver {
  score: number; // 0–10
  sub_kpis?: SubKpi[];
  summary: string;
  deep_analysis?: string;
  justification?: string; // older analyses
  what_works: string[];
  what_doesnt: string[];
  recommendations: (string | Recommendation)[];
  benchmark_context?: string;
}

export interface Report {
  overall_score: number; // 0–10
  grade?: string;
  executive_summary?: string;
  verdict: string;
  top_recommendations: string[];
  drivers: Record<string, Driver>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  creative_critique?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  audience_analysis?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  platform_analysis?: any[];
  risk_assessment?: {
    primary_risks?: string[];
    mitigation_strategies?: string[];
    confidence_level?: 'High' | 'Medium' | 'Low';
    confidence_rationale?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comparable_campaigns?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  industry_benchmarks?: { context?: string; overall_insight?: string; platform_benchmarks?: any[] };
  campaignName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}

export const DRIVER_KEYS = [
  'attention',
  'branding',
  'processing_ease',
  'strategic_fit',
  'emotional_engagement',
  'persuasion',
] as const;

export const DRIVER_LABELS: Record<string, string> = {
  attention: 'Attention',
  branding: 'Branding',
  processing_ease: 'Processing Ease',
  strategic_fit: 'Strategic Fit',
  emotional_engagement: 'Emotional Engagement',
  persuasion: 'Persuasion',
};

// Engine's own weighting (see overall_score description in the analyze SCHEMA)
export const DRIVER_WEIGHTS: Record<string, number> = {
  attention: 0.2,
  strategic_fit: 0.2,
  emotional_engagement: 0.18,
  persuasion: 0.17,
  branding: 0.13,
  processing_ease: 0.12,
};

/** Display score on 0–100 (engine drivers/overall are 0–10). */
export function to100(score0to10: number) {
  return Math.round(score0to10 * 10);
}

/** RAG band on the 0–100 scale: Fix <40 · Watch 40–69 · Strong ≥70 (engine's own thresholds). */
export function band(score100: number): 'green' | 'amber' | 'red' {
  if (score100 >= 70) return 'green';
  if (score100 >= 40) return 'amber';
  return 'red';
}

export const BAND_COLOR: Record<string, string> = {
  green: '#3DDCC8',
  amber: '#F59E0B',
  red: '#EF4444',
};

export const BAND_LABEL: Record<string, string> = {
  green: 'Strong',
  amber: 'Watch',
  red: 'Fix',
};

export function statusColor(status: string) {
  return BAND_COLOR[status] ?? BAND_COLOR.amber;
}
