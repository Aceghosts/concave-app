'use client';

import type { SimilarPastCampaign } from '@/lib/traits';

/**
 * Phase D — similarity-matched calibration card. Renders the server-stamped
 * `similar_past_campaigns` from the report: real past campaigns with their REAL
 * recorded outcome metrics and a computed similarity score. Renders null when
 * the stamp is absent (honest degradation — nothing is ever fabricated).
 *
 * Standalone: created unmounted; the coordinator mounts it on the report page.
 */
export default function SimilarCampaigns({ items }: { items?: SimilarPastCampaign[] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="glass" style={{ padding: '22px 26px' }}>
      <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
        Similar Past Campaigns
        <span style={{ fontSize: 10, fontWeight: 700, color: '#3DDCC8', background: 'rgba(61,220,200,0.10)', border: '1px solid rgba(61,220,200,0.3)', padding: '3px 10px', borderRadius: 99, marginLeft: 10, textTransform: 'uppercase', letterSpacing: '0.6px', verticalAlign: 'middle' }}>
          Measured
        </span>
      </h3>
      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
        Measured results from your calibration history — similarity computed on scored driver profiles.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((c, i) => {
          const metrics = Object.entries(c.outcome_metrics ?? {});
          return (
            <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {c.name}
                  {c.channel && (
                    <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.channel}</span>
                  )}
                </p>
                <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 700, color: '#3DDCC8', whiteSpace: 'nowrap' }}>
                  {Math.round(c.similarity * 100)}% similar
                </span>
              </div>

              {/* similarity bar */}
              <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', margin: '8px 0 10px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round(c.similarity * 100)}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, rgba(61,220,200,0.5), #3DDCC8)' }} />
              </div>

              {metrics.length > 0 ? (
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
                  {metrics.map(([k, v]) => (
                    <div key={k}>
                      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', margin: '0 0 2px' }}>{k}</p>
                      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{String(v)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11.5, color: 'var(--text-muted)', margin: '0 0 6px' }}>No outcome metrics recorded for this campaign.</p>
              )}

              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {c.traits_summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
