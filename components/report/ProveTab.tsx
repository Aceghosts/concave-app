'use client';

import { band, BAND_COLOR, BAND_LABEL, driverLabel, orderedDriverKeys, statusColor, to100, type Report } from './types';

export const METHODOLOGY_NOTE =
  'Concave is expert AI critique: a large language model applying a structured effectiveness framework. ' +
  'We validate it the honest way — by measuring agreement with senior strategists — and we do not claim to simulate brains or predict CTR.';

/** Prove tab: the evidence digest formatted for client presentation. Maps 1:1 to the PPTX export.
 *  Run-vs-run deltas are not rendered — the data model has no variant/run linkage yet. */
export default function ProveTab({ report }: { report: Report }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Executive summary + verdict (PPTX slide 2) */}
      <div className="glass" style={{ padding: '26px 30px', borderLeft: `4px solid ${BAND_COLOR[band(to100(report.overall_score))]}` }}>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
          Executive summary
        </p>
        {report.executive_summary && (
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>
            {report.executive_summary}
          </p>
        )}
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>
          {report.verdict}
        </p>
      </div>

      {/* 2. Per-driver evidence digest (PPTX slides 3–9) */}
      {orderedDriverKeys(report.drivers).map(key => {
        const d = report.drivers[key];
        if (!d) return null;
        const s = to100(d.score);
        const color = BAND_COLOR[band(s)];
        return (
          <div key={key} className="glass" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                {driverLabel(key)}
              </span>
              <span className="font-bebas" style={{ fontSize: 24, color, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{s}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>
              {d.summary}
            </p>
            {Array.isArray(d.sub_kpis) && d.sub_kpis.filter(k => k.evidence).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {d.sub_kpis.filter(k => k.evidence).map((k, i) => (
                  <p key={i} style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55, borderLeft: `2px solid ${statusColor(k.status)}55`, paddingLeft: 10 }}>
                    <strong style={{ color: statusColor(k.status) }}>{k.name} · {BAND_LABEL[k.status]}:</strong> {k.evidence}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* 3. Ranked recommendations (PPTX slide: recommendations) */}
      {report.top_recommendations?.length > 0 && (
        <div className="glass" style={{ padding: '22px 26px' }}>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Recommendations, ranked
          </p>
          {report.top_recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <span className="font-bebas" style={{ fontSize: 18, color: 'var(--accent)', lineHeight: 1.2, minWidth: 16 }}>{i + 1}</span>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{rec}</p>
            </div>
          ))}
        </div>
      )}

      {/* 4. Risk & confidence */}
      {report.risk_assessment && (
        <div className="glass" style={{ padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Risk assessment
            </p>
            {report.risk_assessment.confidence_level && (
              <span style={{
                fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99,
                background: report.risk_assessment.confidence_level === 'High' ? 'rgba(61,220,200,0.12)' : report.risk_assessment.confidence_level === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.1)',
                color: report.risk_assessment.confidence_level === 'High' ? '#3DDCC8' : report.risk_assessment.confidence_level === 'Medium' ? '#F59E0B' : '#EF4444',
              }}>
                Confidence: {report.risk_assessment.confidence_level}
              </span>
            )}
          </div>
          {(report.risk_assessment.primary_risks || []).map((r, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                <span style={{ color: '#EF4444', marginRight: 6 }}>⚠</span>{r}
              </p>
              {report.risk_assessment?.mitigation_strategies?.[i] && (
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 18px', lineHeight: 1.45 }}>
                  <span style={{ color: '#3DDCC8', marginRight: 4 }}>✓</span>{report.risk_assessment.mitigation_strategies[i]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5. Methodology note (PPTX closing slide) */}
      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, padding: '0 4px' }}>
        {METHODOLOGY_NOTE}
      </p>
    </div>
  );
}
