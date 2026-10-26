'use client';

import { ArrowRight } from 'lucide-react';
import { band, BAND_COLOR, DRIVER_LABELS, to100, type Driver, type Recommendation } from './types';
import KpiRow from './KpiRow';

/** Predict-tab driver section: driver score, summary verdict paragraph, sub-KPI rows, then depth. */
export default function DriverSection({ driverKey, driver }: { driverKey: string; driver: Driver }) {
  const s = to100(driver.score);
  const color = BAND_COLOR[band(s)];

  return (
    <section id={`driver-${driverKey}`} className="glass" style={{ padding: '24px 26px', borderLeft: `3px solid ${color}`, scrollMarginTop: 96 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
        <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {DRIVER_LABELS[driverKey] ?? driverKey}
        </h2>
        <span className="font-bebas" style={{ fontSize: 30, color, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
          {s}<span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 2 }}>/100</span>
        </span>
      </div>

      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 14px', lineHeight: 1.6 }}>
        {driver.summary}
      </p>

      {Array.isArray(driver.sub_kpis) && driver.sub_kpis.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {driver.sub_kpis.map((k, i) => <KpiRow key={i} kpi={k} />)}
        </div>
      )}

      {/* Depth lives behind one toggle — scores and verdicts stay scannable by default */}
      <details>
        <summary style={{ cursor: 'pointer', listStyle: 'none', fontFamily: 'var(--font-poppins)', fontSize: 11.5, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.4px', padding: '4px 0', userSelect: 'none' }}>
          Full analysis &amp; fixes ↓
        </summary>
        <div style={{ marginTop: 12 }}>

      {(driver.deep_analysis || driver.justification) && (
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
          {driver.deep_analysis || driver.justification}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 14 }}>
        {driver.what_works?.length > 0 && (
          <div style={{ background: 'rgba(61,220,200,0.05)', border: '1px solid rgba(61,220,200,0.13)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3DDCC8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Works</p>
            {driver.what_works.map((w, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 5px', lineHeight: 1.45 }}>
                <span style={{ color: '#3DDCC8', marginRight: 4 }}>✓</span>{w}
              </p>
            ))}
          </div>
        )}
        {driver.what_doesnt?.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.11)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Doesn&apos;t</p>
            {driver.what_doesnt.map((w, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 5px', lineHeight: 1.45 }}>
                <span style={{ color: '#EF4444', marginRight: 4 }}>✗</span>{w}
              </p>
            ))}
          </div>
        )}
      </div>

      {driver.recommendations?.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Recommendations</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {driver.recommendations.map((r, i) => {
              const rec = typeof r === 'string' ? null : (r as Recommendation);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <ArrowRight size={12} color={color} style={{ marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                      {rec ? rec.action : (r as string)}
                    </p>
                    {rec?.rationale && (
                      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.45 }}>{rec.rationale}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {driver.benchmark_context && (
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: '12px 0 0', lineHeight: 1.55, background: 'var(--accent-dim)', border: '1px solid rgba(61,220,200,0.12)', borderRadius: 8, padding: '10px 12px' }}>
              <strong style={{ color: 'var(--accent)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>Benchmark context</strong>
              {driver.benchmark_context}
            </p>
          )}
        </div>
      )}
        </div>
      </details>
    </section>
  );
}
