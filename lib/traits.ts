// Creative-trait profiles + similarity (Phase D extension).
// Pure functions — no I/O. A profile is derived ONLY from a real stored analysis
// report; every number in it traces back to a scored driver/sub-KPI.

export type TraitProfile = {
  v: 1;
  channel: string | null;
  schema_variant: 'drivers' | 'lenses';
  /** Driver (or lens) scores on 0-100, keyed by driver key. */
  drivers: Record<string, number>;
  /** Top-2 strongest sub-KPI names across all drivers. */
  strengths: string[];
  /** Top-2 weakest sub-KPI names across all drivers. */
  weaknesses: string[];
  grade: string | null;
};

type SubKpiLike = { name?: unknown; score?: unknown };
type DriverLike = { score?: unknown; sub_kpis?: SubKpiLike[] };
type ReportLike = {
  channel?: unknown;
  schema_variant?: unknown;
  grade?: unknown;
  drivers?: Record<string, DriverLike>;
};

const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * Compact versioned trait profile from any analysis report (6-driver or
 * 3-lens variant). Returns null when the report has no scored drivers —
 * never fabricates a profile.
 */
export function deriveTraitProfile(report: unknown): TraitProfile | null {
  const r = report as ReportLike;
  if (!r || typeof r !== 'object' || !r.drivers || typeof r.drivers !== 'object') return null;

  const drivers: Record<string, number> = {};
  const kpis: { name: string; score: number }[] = [];
  for (const [key, d] of Object.entries(r.drivers)) {
    if (!d || typeof d.score !== 'number') continue;
    drivers[key] = clamp100(d.score * 10); // engine scores are 0-10
    if (Array.isArray(d.sub_kpis)) {
      for (const k of d.sub_kpis) {
        if (typeof k?.name === 'string' && typeof k?.score === 'number') {
          kpis.push({ name: k.name, score: k.score });
        }
      }
    }
  }
  if (Object.keys(drivers).length === 0) return null;

  const byScore = [...kpis].sort((a, b) => b.score - a.score);
  return {
    v: 1,
    channel: typeof r.channel === 'string' ? r.channel : null,
    schema_variant: r.schema_variant === 'lenses' ? 'lenses' : 'drivers',
    drivers,
    strengths: byScore.slice(0, 2).map(k => k.name),
    weaknesses: byScore.slice(-2).reverse().map(k => k.name),
    grade: typeof r.grade === 'string' ? r.grade : null,
  };
}

/** Narrowing guard for profiles read back from past_campaigns.creative_traits.profile. */
export function isTraitProfile(v: unknown): v is TraitProfile {
  const p = v as TraitProfile;
  return !!p && typeof p === 'object' && p.v === 1
    && !!p.drivers && typeof p.drivers === 'object'
    && Object.values(p.drivers).every(n => typeof n === 'number');
}

/** One-line human summary, e.g. "strong: First-3-Seconds Hook, Scroll-Stop Power; weak: CTA Clarity, Offer Clarity". */
export function summarizeTraits(p: TraitProfile): string {
  const parts: string[] = [];
  if (p.strengths.length) parts.push(`strong: ${p.strengths.join(', ')}`);
  if (p.weaknesses.length) parts.push(`weak: ${p.weaknesses.join(', ')}`);
  if (!parts.length) {
    parts.push(Object.entries(p.drivers).map(([k, v]) => `${k} ${v}`).join(', '));
  }
  return parts.join('; ');
}

/**
 * Similarity 0-1 between two trait profiles: 1 − mean absolute distance over
 * the shared driver keys (0-100 scale), scaled ×0.85 when channels differ.
 * Returns null when the profiles share no driver keys (e.g. drivers vs lenses)
 * — incomparable is reported as incomparable, never as a number.
 */
// ponytail: mean-abs-distance over driver vectors; upgrade to weighted/cosine over sub-KPIs if matches feel coarse
export function traitSimilarity(a: TraitProfile, b: TraitProfile): number | null {
  const shared = Object.keys(a.drivers).filter(k => k in b.drivers);
  if (shared.length === 0) return null;
  const meanAbs = shared.reduce((s, k) => s + Math.abs(a.drivers[k] - b.drivers[k]), 0) / shared.length;
  let sim = 1 - meanAbs / 100;
  if (a.channel && b.channel && a.channel !== b.channel) sim *= 0.85;
  return Math.round(Math.max(0, Math.min(1, sim)) * 100) / 100;
}

/** Shape stamped onto the analysis as `similar_past_campaigns` and rendered by SimilarCampaigns.tsx. */
export type SimilarPastCampaign = {
  name: string;
  channel: string | null;
  similarity: number; // 0-1
  outcome_metrics: Record<string, unknown>;
  traits_summary: string;
};
