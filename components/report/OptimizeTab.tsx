'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BAND_LABEL, DRIVER_WEIGHTS, driverLabel, orderedDriverKeys, statusColor, type Report, type Recommendation } from './types';

interface RankedKpi {
  driverKey: string;
  name: string;
  score: number;
  status: 'amber' | 'red';
  verdict: string;
  evidence?: string;
  rank: number;
}

/** Optimize tab: every red/amber sub-KPI across drivers, ranked by severity × driver weight,
 *  with local "mark addressed" state, followed by the drivers' fix lists. */
export default function OptimizeTab({ report }: { report: Report }) {
  const [addressed, setAddressed] = useState<Set<string>>(new Set());

  const keys = useMemo(() => orderedDriverKeys(report.drivers), [report]);

  const ranked = useMemo<RankedKpi[]>(() => {
    const out: RankedKpi[] = [];
    for (const key of keys) {
      const d = report.drivers[key];
      if (!d?.sub_kpis) continue;
      for (const k of d.sub_kpis) {
        if (k.status === 'green') continue;
        out.push({
          driverKey: key,
          name: k.name,
          score: Math.round(k.score),
          status: k.status as 'amber' | 'red',
          verdict: k.verdict,
          evidence: k.evidence,
          // severity (distance below the green threshold) × engine driver weight
          rank: (70 - k.score) * (DRIVER_WEIGHTS[key] ?? 0.15),
        });
      }
    }
    return out.sort((a, b) => b.rank - a.rank);
  }, [report, keys]);

  const fixDrivers = useMemo(
    () => keys.filter(key => ranked.some(r => r.driverKey === key) && (report.drivers[key]?.recommendations?.length ?? 0) > 0),
    [ranked, report, keys],
  );

  function toggle(id: string) {
    setAddressed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  if (ranked.length === 0) {
    return (
      <div className="glass" style={{ padding: '32px 36px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, color: 'var(--text-primary)', margin: '0 0 6px', fontWeight: 600 }}>
          Nothing to fix — every sub-KPI is in the green band.
        </p>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          {report.drivers && Object.values(report.drivers).some(d => d.sub_kpis?.length)
            ? 'Review the Predict tab for the full breakdown.'
            : 'This analysis predates sub-KPI scoring — re-run it to get the ranked fix list.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {report.top_recommendations?.length > 0 && (
        <div className="glass" style={{ padding: '22px 26px', borderLeft: '3px solid var(--accent)' }}>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Highest-impact moves
          </p>
          {report.top_recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <span className="font-bebas" style={{ fontSize: 18, color: 'var(--accent)', lineHeight: 1.2, minWidth: 16 }}>{i + 1}</span>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{rec}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
          Weak sub-KPIs, ranked by severity × driver weight
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ranked.map((k, idx) => {
            const id = `${k.driverKey}:${k.name}`;
            const done = addressed.has(id);
            const color = statusColor(k.status);
            return (
              <div key={id} className="glass" style={{ padding: '14px 18px', borderLeft: `3px solid ${color}`, opacity: done ? 0.55 : 1, transition: 'opacity 0.2s', display: 'flex', gap: 14 }}>
                <span className="font-bebas" style={{ fontSize: 24, color: 'var(--text-muted)', lineHeight: 1.1, flexShrink: 0, minWidth: 22, textAlign: 'right' }}>{idx + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                    {k.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: 99 }}>
                    {driverLabel(k.driverKey)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color, background: `${color}1f`, padding: '2px 9px', borderRadius: 99 }}>
                    {BAND_LABEL[k.status]} · {k.score}/100
                  </span>
                  <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontSize: 11, color: done ? 'var(--accent)' : 'var(--text-muted)' }}>
                    <input type="checkbox" checked={done} onChange={() => toggle(id)} style={{ display: 'none' }} />
                    <CheckCircle2 size={15} color={done ? 'var(--accent)' : 'var(--text-muted)'} />
                    {done ? 'Addressed' : 'Mark addressed'}
                  </label>
                </div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{k.verdict}</p>
                {k.evidence && (
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.5, fontStyle: 'italic' }}>{k.evidence}</p>
                )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {fixDrivers.length > 0 && (
        <div>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            Do this — fixes from each weak driver
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fixDrivers.map(key => (
              <div key={key} className="glass" style={{ padding: '16px 20px' }}>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>
                  {driverLabel(key)}
                </p>
                {report.drivers[key].recommendations.map((r, i) => {
                  const rec = typeof r === 'string' ? null : (r as Recommendation);
                  const pColor = rec?.priority === 'Critical' ? '#EF4444' : rec?.priority === 'High' ? '#F59E0B' : '#3DDCC8';
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      {rec && (
                        <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 99, background: `${pColor}1f`, color: pColor, marginRight: 8 }}>
                          {rec.priority}
                        </span>
                      )}
                      <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {rec ? rec.action : (r as string)}
                      </span>
                      {rec?.effort && (
                        <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', marginLeft: 8, verticalAlign: 'middle' }}>
                          {rec.effort} effort
                        </span>
                      )}
                      {rec?.rationale && (
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.45 }}>{rec.rationale}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
