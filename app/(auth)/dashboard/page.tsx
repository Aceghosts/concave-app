'use client';

// Dashboard = asset library + meta-analysis (functional spec Phase C).
// Everything shown is computed from real /api/analyses rows — no fabricated stats.

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles, TrendingDown } from 'lucide-react';
import { CHANNELS, LENS_KEYS, isChannelId } from '@/lib/channels';
import { useClients } from '@/context/ClientContext';

type DriverCell = { score?: number | null } | null | undefined;

type Row = {
  id: string;
  campaign_name: string;
  client_id: string | null;
  overall_score: number | null;
  grade: string | null;
  created_at: string;
  channel?: string | null;
  schema_variant?: string | null;
  drivers?: Record<string, DriverCell> | null;
};

const DRIVER_ORDER = ['attention', 'branding', 'processing_ease', 'strategic_fit', 'emotional_engagement', 'persuasion'];
const DRIVER_LABEL: Record<string, string> = {
  attention: 'Attention',
  branding: 'Branding',
  processing_ease: 'Processing Ease',
  strategic_fit: 'Strategic Fit',
  emotional_engagement: 'Emotional Engagement',
  persuasion: 'Persuasion',
  recognition: 'Recognition',
  motivation: 'Motivation',
};

const BAND = {
  green: '#34D399',
  amber: '#FBBF24',
  red: '#F87171',
} as const;

function band(score100: number): keyof typeof BAND {
  return score100 >= 70 ? 'green' : score100 >= 40 ? 'amber' : 'red';
}

/** Engine scores are 0–10; library displays 0–100 like the report UI. */
function to100(v: number | null | undefined) {
  return Math.round(Number(v ?? 0) * 10);
}

function channelLabel(row: Row) {
  // Reports predating channels ran the default app — honest to label them so.
  return isChannelId(row.channel) ? CHANNELS[row.channel].label : CHANNELS.campaign_brief.label;
}

function driverKeysFor(row: Row): string[] {
  if (row.schema_variant === 'lenses') return [...LENS_KEYS];
  return DRIVER_ORDER;
}

const label: React.CSSProperties = {
  fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700,
  letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)',
};

const chip: React.CSSProperties = {
  fontFamily: 'var(--font-poppins)', fontSize: 10.5, fontWeight: 600,
  padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap',
};

function FilterSelect({ value, onChange, options, width = 160 }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: number;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="input"
      style={{ width, padding: '9px 12px', fontSize: 13, cursor: 'pointer' }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: '#0C1020' }}>{o.label}</option>
      ))}
    </select>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { clients } = useClients();
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Stage gate ("team bar"), 0–100, persisted locally
  const [threshold, setThreshold] = useState(70);
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem('concave-team-bar'));
      if (Number.isFinite(stored) && stored > 0) setThreshold(stored);
    } catch { /* storage unavailable — keep default */ }
  }, []);
  function updateThreshold(v: number) {
    const clamped = Math.max(1, Math.min(100, Math.round(v)));
    setThreshold(clamped);
    try { localStorage.setItem('concave-team-bar', String(clamped)); } catch { /* ignore */ }
  }

  // Filters
  const [clientF, setClientF] = useState('all');
  const [channelF, setChannelF] = useState('all');
  const [bandF, setBandF] = useState('all');
  const [sort, setSort] = useState<'new' | 'old'>('new');

  useEffect(() => {
    fetch('/api/analyses')
      .then(r => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data as Row[]);
        else if (data?.error) setLoadError(String(data.error));
      })
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Could not load analyses'))
      .finally(() => setLoaded(true));
  }, []);

  const filtered = useMemo(() => {
    const out = rows.filter(r => {
      if (clientF !== 'all' && r.client_id !== clientF) return false;
      if (channelF !== 'all') {
        const ch = isChannelId(r.channel) ? r.channel : 'campaign_brief';
        if (ch !== channelF) return false;
      }
      if (bandF !== 'all' && band(to100(r.overall_score)) !== bandF) return false;
      return true;
    });
    out.sort((a, b) => sort === 'new'
      ? +new Date(b.created_at) - +new Date(a.created_at)
      : +new Date(a.created_at) - +new Date(b.created_at));
    return out;
  }, [rows, clientF, channelF, bandF, sort]);

  // Meta-analysis across the filtered set
  const meta = useMemo(() => {
    const n = filtered.length;
    if (n === 0) return null;
    const scores = filtered.map(r => to100(r.overall_score));
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / n);
    const pass = scores.filter(s => s >= threshold).length;

    const sums: Record<string, { total: number; count: number }> = {};
    for (const r of filtered) {
      if (!r.drivers) continue;
      for (const [key, d] of Object.entries(r.drivers)) {
        const s = Number(d?.score);
        if (!Number.isFinite(s)) continue;
        (sums[key] ??= { total: 0, count: 0 });
        sums[key].total += s * 10;
        sums[key].count += 1;
      }
    }
    const perDriver = Object.entries(sums)
      .map(([key, { total, count }]) => ({ key, avg: Math.round(total / count), count }))
      .sort((a, b) => DRIVER_ORDER.indexOf(a.key) - DRIVER_ORDER.indexOf(b.key));
    const weakest = perDriver.length ? perDriver.reduce((w, d) => (d.avg < w.avg ? d : w)) : null;

    return { n, avg, pass, passRate: Math.round((pass / n) * 100), perDriver, weakest };
  }, [filtered, threshold]);

  const clientName = (id: string | null) =>
    id ? (clients.find(c => c.id === id)?.name ?? 'Client') : '—';

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1260, margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Asset library &amp; meta-analysis</p>
          <h1 className="font-bebas" style={{ fontSize: 42, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--text-primary)' }}>
            DASHBOARD
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/analyze')}
          className="btn-primary"
          style={{ padding: '11px 22px', fontSize: 14 }}
        >
          <Plus size={15} /> New Analysis
        </motion.button>
      </motion.div>

      {/* Meta panel */}
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
        className="glass"
        style={{ padding: '24px 28px', marginBottom: 20 }}
      >
        {meta ? (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 }}>
            {/* Headline numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { l: 'Analyses', v: String(meta.n) },
                { l: 'Average score', v: String(meta.avg) },
                { l: `Pass rate (bar ${threshold})`, v: `${meta.passRate}%` },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p style={{ ...label, margin: '0 0 2px' }}>{l}</p>
                  <p className="font-bebas mk-tnum" style={{ fontSize: 34, lineHeight: 1, margin: 0, color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
              {/* Stage gate editor */}
              <div>
                <p style={{ ...label, margin: '0 0 6px' }}>Team bar</p>
                <input
                  type="number" min={1} max={100} value={threshold}
                  onChange={e => updateThreshold(Number(e.target.value))}
                  className="input"
                  aria-label="Stage-gate threshold (team bar)"
                  style={{ width: 90, padding: '7px 10px', fontSize: 14 }}
                />
              </div>
            </div>

            {/* Per-driver averages — hand-rolled SVG bars */}
            <div>
              <p style={{ ...label, margin: '0 0 14px' }}>Driver averages across filtered set</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {meta.perDriver.map(d => (
                  <div key={d.key} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 40px', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {DRIVER_LABEL[d.key] ?? d.key}
                    </span>
                    <svg viewBox="0 0 100 6" preserveAspectRatio="none" style={{ width: '100%', height: 6, display: 'block' }} aria-hidden>
                      <rect x="0" y="0" width="100" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
                      <rect x="0" y="0" width={Math.max(2, d.avg)} height="6" rx="3" fill={BAND[band(d.avg)]} />
                    </svg>
                    <span className="mk-tnum" style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>
                      {d.avg}
                    </span>
                  </div>
                ))}
              </div>
              {meta.weakest && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginTop: 16,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)',
                }}>
                  <TrendingDown size={14} color={BAND.red} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    Systematically weakest driver:{' '}
                    <strong style={{ color: BAND.red }}>{DRIVER_LABEL[meta.weakest.key] ?? meta.weakest.key}</strong>
                    {' '}(avg {meta.weakest.avg} across {meta.weakest.count} {meta.weakest.count === 1 ? 'analysis' : 'analyses'})
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {loaded
              ? (loadError ? `Could not load analyses: ${loadError}` : 'No analyses yet — the meta-analysis appears once real reports exist.')
              : 'Loading analyses…'}
          </p>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}
      >
        <FilterSelect value={clientF} onChange={setClientF} options={[
          { value: 'all', label: 'All clients' },
          ...clients.map(c => ({ value: c.id, label: c.name })),
        ]} />
        <FilterSelect value={channelF} onChange={setChannelF} options={[
          { value: 'all', label: 'All channels' },
          ...Object.values(CHANNELS).map(c => ({ value: c.id, label: c.label })),
        ]} width={190} />
        <FilterSelect value={bandF} onChange={setBandF} options={[
          { value: 'all', label: 'All score bands' },
          { value: 'green', label: `Strong (≥70)` },
          { value: 'amber', label: 'Moderate (40–69)' },
          { value: 'red', label: 'Weak (<40)' },
        ]} width={170} />
        <FilterSelect value={sort} onChange={v => setSort(v as 'new' | 'old')} options={[
          { value: 'new', label: 'Newest first' },
          { value: 'old', label: 'Oldest first' },
        ]} width={140} />
        <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {filtered.length} {filtered.length === 1 ? 'analysis' : 'analyses'}
        </span>
      </motion.div>

      {/* Library table */}
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="glass"
        style={{ padding: '10px 10px 6px', overflowX: 'auto' }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 0' }}>
            <Sparkles size={26} color="#3DDCC8" style={{ margin: '0 auto 12px', opacity: 0.45 }} />
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {rows.length === 0 ? (loaded ? 'No analyses yet' : 'Loading…') : 'Nothing matches these filters.'}
            </p>
            {loaded && rows.length === 0 && !loadError && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/analyze')}
                className="btn-primary" style={{ padding: '9px 20px' }}>
                Start your first analysis
              </motion.button>
            )}
          </div>
        ) : (
          <div style={{ minWidth: 920 }}>
            {/* Head */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px,1.4fr) 130px 110px 64px 96px 120px 76px 100px',
              gap: 10, padding: '10px 14px 10px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              {['Campaign', 'Channel', 'Client', 'Score', 'Grade', 'Drivers', 'Date', 'Gate'].map(h => (
                <span key={h} style={label}>{h}</span>
              ))}
            </div>
            {filtered.map((r, i) => {
              const score = to100(r.overall_score);
              const pass = score >= threshold;
              const keys = driverKeysFor(r);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(0.3 + i * 0.03, 0.8) }}
                  onClick={() => router.push(`/analyze/${r.id}`)}
                  whileHover={{ backgroundColor: 'rgba(61,220,200,0.05)' }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(180px,1.4fr) 130px 110px 64px 96px 120px 76px 100px',
                    gap: 10, padding: '13px 14px', alignItems: 'center',
                    borderBottom: '1px solid var(--border-subtle)', borderRadius: 10,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.campaign_name}
                  </span>
                  <span style={{
                    ...chip,
                    color: '#3DDCC8', background: 'rgba(61,220,200,0.10)',
                    border: '1px solid rgba(61,220,200,0.22)',
                    justifySelf: 'start', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                  }}>
                    {channelLabel(r)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {clientName(r.client_id)}
                  </span>
                  <span className="font-bebas mk-tnum" style={{ fontSize: 22, lineHeight: 1, color: BAND[band(score)] }}>
                    {score}
                  </span>
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11.5, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.grade ?? '—'}
                  </span>
                  {/* RAG dots (6 for drivers, 3 for lenses reports) */}
                  <span style={{ display: 'flex', gap: 5 }}>
                    {keys.map(k => {
                      const d = r.drivers?.[k];
                      const s = Number(d?.score);
                      const has = Number.isFinite(s);
                      return (
                        <span
                          key={k}
                          title={`${DRIVER_LABEL[k] ?? k}: ${has ? Math.round(s * 10) : 'n/a'}`}
                          style={{
                            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                            background: has ? BAND[band(s * 10)] : 'rgba(255,255,255,0.15)',
                          }}
                        />
                      );
                    })}
                  </span>
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{
                    ...chip,
                    justifySelf: 'start',
                    color: pass ? BAND.green : BAND.red,
                    background: pass ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                    border: `1px solid ${pass ? 'rgba(52,211,153,0.28)' : 'rgba(248,113,113,0.28)'}`,
                  }}>
                    {pass ? 'PASS' : 'BELOW BAR'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
