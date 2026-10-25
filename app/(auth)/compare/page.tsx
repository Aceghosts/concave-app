'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftRight } from 'lucide-react';
import ScoreRing from '@/components/report/ScoreRing';
import { DRIVER_KEYS, DRIVER_LABELS, band, BAND_COLOR, to100, type Report, type SubKpi } from '@/components/report/types';
import { useClients } from '@/context/ClientContext';

type ListRow = { id: string; campaign_name: string; client_id: string | null; overall_score: number | null; grade: string | null; created_at: string };
type FullRow = ListRow & { report: Report; intake?: { channel?: string } & Record<string, unknown> };

const poppins = { fontFamily: 'var(--font-poppins)' } as const;

function labelFor(key: string) {
  return DRIVER_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function DeltaChip({ delta }: { delta: number }) {
  const color = delta > 0 ? BAND_COLOR.green : delta < 0 ? BAND_COLOR.red : 'var(--text-muted)';
  const text = delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : '±0';
  return (
    <span style={{
      ...poppins, fontSize: 11, fontWeight: 700, color,
      background: delta === 0 ? 'rgba(255,255,255,0.06)' : `${color}18`,
      padding: '3px 10px', borderRadius: 20, fontFeatureSettings: '"tnum"', whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}

function MiniBar({ score100, dim }: { score100: number; dim?: boolean }) {
  const color = BAND_COLOR[band(score100)];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${score100}%`, height: '100%', borderRadius: 99, background: color, opacity: dim ? 0.55 : 1, boxShadow: `0 0 8px ${color}50` }} />
      </div>
      <span className="font-bebas" style={{ fontSize: 18, color, lineHeight: 1, width: 28, textAlign: 'right', fontFeatureSettings: '"tnum"' }}>{score100}</span>
    </div>
  );
}

/** Driver keys ordered: standard six first, then any extras (e.g. script app's 3 lenses). */
function orderedKeys(keys: string[]) {
  const std = DRIVER_KEYS.filter((k) => keys.includes(k));
  const extra = keys.filter((k) => !(DRIVER_KEYS as readonly string[]).includes(k)).sort();
  return [...std, ...extra];
}

function VariantHeader({ row, tag, clientName }: { row: FullRow; tag: string; clientName: string }) {
  return (
    <div className="glass-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
      <span style={{ ...poppins, fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: 'var(--accent, #3DDCC8)', textTransform: 'uppercase' }}>
        Variant {tag}
      </span>
      <ScoreRing score100={to100(Number(row.report?.overall_score ?? 0))} size={110} label="" />
      <div>
        <p style={{ ...poppins, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{row.campaign_name}</p>
        <p style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          {clientName} · {fmtDate(row.created_at)}{row.grade ? ` · ${row.grade}` : ''}
          {row.intake?.channel ? ` · ${row.intake.channel}` : ''}
        </p>
      </div>
    </div>
  );
}

function Picker({ list, a, b, clientName }: { list: ListRow[]; a: string; b: string; clientName: (id: string | null) => string }) {
  const router = useRouter();
  const [selA, setSelA] = useState(a);
  const [selB, setSelB] = useState(b);

  const option = (r: ListRow) =>
    `${r.campaign_name} — ${clientName(r.client_id)} · ${fmtDate(r.created_at)} · ${to100(Number(r.overall_score ?? 0))}`;

  return (
    <div className="glass-card" style={{ padding: 28, maxWidth: 640 }}>
      <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
        Pick two saved analyses to compare side-by-side.
      </p>
      {(['A', 'B'] as const).map((tag) => {
        const val = tag === 'A' ? selA : selB;
        const set = tag === 'A' ? setSelA : setSelB;
        return (
          <div key={tag} style={{ marginBottom: 14 }}>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>Variant {tag}</label>
            <select value={val} onChange={(e) => set(e.target.value)} className="input" style={{ width: '100%' }}>
              <option value="">Select an analysis…</option>
              {list.map((r) => (
                <option key={r.id} value={r.id}>{option(r)}</option>
              ))}
            </select>
          </div>
        );
      })}
      <button
        className="btn-primary"
        disabled={!selA || !selB || selA === selB}
        style={{ marginTop: 8, opacity: !selA || !selB || selA === selB ? 0.5 : 1 }}
        onClick={() => router.push(`/compare?a=${selA}&b=${selB}`)}
      >
        <ArrowLeftRight size={15} style={{ marginRight: 8, verticalAlign: '-2px' }} />
        Compare
      </button>
      {selA && selA === selB && (
        <p style={{ ...poppins, fontSize: 12, color: BAND_COLOR.amber, marginTop: 10 }}>Pick two different analyses.</p>
      )}
    </div>
  );
}

function CompareContent() {
  const params = useSearchParams();
  const a = params.get('a') ?? '';
  const b = params.get('b') ?? '';
  const { clients } = useClients();

  const [list, setList] = useState<ListRow[]>([]);
  const [rowA, setRowA] = useState<FullRow | null>(null);
  const [rowB, setRowB] = useState<FullRow | null>(null);
  const [loading, setLoading] = useState(!!(a && b));
  const [error, setError] = useState<string | null>(null);

  const clientName = (id: string | null) => clients.find((c) => c.id === id)?.name ?? 'No client';

  useEffect(() => {
    fetch('/api/analyses')
      .then((r) => r.json())
      .then((rows) => Array.isArray(rows) && setList(rows))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!a || !b) { setRowA(null); setRowB(null); setLoading(false); setError(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(
      [a, b].map((id) =>
        fetch(`/api/analyses?id=${encodeURIComponent(id)}`).then(async (r) => {
          if (!r.ok) throw new Error(`Analysis ${id} not found`);
          return r.json() as Promise<FullRow>;
        })
      )
    )
      .then(([ra, rb]) => { if (!cancelled) { setRowA(ra); setRowB(rb); } })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [a, b]);

  const drivers = useMemo(() => {
    if (!rowA?.report?.drivers || !rowB?.report?.drivers) return null;
    const keysA = Object.keys(rowA.report.drivers);
    const keysB = Object.keys(rowB.report.drivers);
    const shared = orderedKeys(keysA.filter((k) => keysB.includes(k)));
    const onlyOne = orderedKeys([...keysA.filter((k) => !keysB.includes(k)), ...keysB.filter((k) => !keysA.includes(k))]);
    return { shared, onlyOne };
  }, [rowA, rowB]);

  const verdict = useMemo(() => {
    if (!drivers || !rowA || !rowB) return null;
    const winsB: string[] = [];
    const winsA: string[] = [];
    for (const k of drivers.shared) {
      const d = to100(rowB.report.drivers[k].score) - to100(rowA.report.drivers[k].score);
      if (d > 0) winsB.push(labelFor(k));
      else if (d < 0) winsA.push(labelFor(k));
    }
    if (!winsA.length && !winsB.length) return 'Dead heat — identical scores on every shared driver.';
    const parts: string[] = [];
    if (winsB.length) parts.push(`B wins on ${winsB.join(', ')}`);
    if (winsA.length) parts.push(`A wins on ${winsA.join(', ')}`);
    return parts.join('; ') + '.';
  }, [drivers, rowA, rowB]);

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 28 }}>
        <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>A/B Comparison</p>
        <h1 className="font-bebas" style={{ fontSize: 36, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1 }}>COMPARE</h1>
      </motion.div>

      {(!a || !b) && (
        list.length === 0
          ? <p style={{ ...poppins, fontSize: 14, color: 'var(--text-muted)' }}>No saved analyses yet. Run an analysis first, then come back to compare.</p>
          : <Picker list={list} a={a} b={b} clientName={clientName} />
      )}

      {a && b && loading && (
        <p style={{ ...poppins, fontSize: 14, color: 'var(--text-muted)' }}>Loading both analyses…</p>
      )}

      {a && b && !loading && error && (
        <div className="glass-card" style={{ padding: 24, maxWidth: 640 }}>
          <p style={{ ...poppins, fontSize: 14, color: BAND_COLOR.red, margin: 0 }}>{error}</p>
          <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)', margin: '10px 0 0' }}>
            <a href="/compare" style={{ color: 'var(--accent, #3DDCC8)' }}>Pick different analyses</a>
          </p>
        </div>
      )}

      {rowA && rowB && !loading && !error && drivers && (
        <>
          {/* Side-by-side headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <VariantHeader row={rowA} tag="A" clientName={clientName(rowA.client_id)} />
            <VariantHeader row={rowB} tag="B" clientName={clientName(rowB.client_id)} />
          </div>

          {/* Verdict */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: '16px 24px', marginBottom: 16 }}>
            <p style={{ ...poppins, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{verdict}</p>
            {drivers.onlyOne.length > 0 && (
              <p style={{ ...poppins, fontSize: 12, color: BAND_COLOR.amber, margin: '8px 0 0' }}>
                These analyses use different scoring schemas — only shared drivers are compared.
                Not shared: {drivers.onlyOne.map(labelFor).join(', ')}.
              </p>
            )}
          </motion.div>

          {/* Paired driver bars */}
          <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 className="font-bebas" style={{ fontSize: 20, letterSpacing: 1, color: 'var(--text-primary)', margin: '0 0 18px' }}>DRIVERS</h2>
            {drivers.shared.length === 0 && (
              <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)' }}>No shared drivers between these two analyses.</p>
            )}
            {drivers.shared.map((k) => {
              const sa = to100(rowA.report.drivers[k].score);
              const sb = to100(rowB.report.drivers[k].score);
              return (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 1fr 64px', gap: 16, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ ...poppins, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{labelFor(k)}</span>
                  <MiniBar score100={sa} dim />
                  <MiniBar score100={sb} />
                  <div style={{ textAlign: 'right' }}><DeltaChip delta={sb - sa} /></div>
                </div>
              );
            })}
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 1fr 64px', gap: 16, paddingTop: 10 }}>
              <span />
              <span style={{ ...poppins, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Variant A</span>
              <span style={{ ...poppins, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Variant B</span>
              <span style={{ ...poppins, fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>Δ B−A</span>
            </div>
          </div>

          {/* Sub-KPI delta table */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 className="font-bebas" style={{ fontSize: 20, letterSpacing: 1, color: 'var(--text-primary)', margin: '0 0 6px' }}>SUB-KPIS</h2>
            <p style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
              Rows aligned by KPI name. An em-dash means that KPI exists in only one variant.
            </p>
            {drivers.shared.map((k) => {
              const kpisA: SubKpi[] = rowA.report.drivers[k].sub_kpis ?? [];
              const kpisB: SubKpi[] = rowB.report.drivers[k].sub_kpis ?? [];
              const names = [...kpisA.map((x) => x.name), ...kpisB.filter((x) => !kpisA.some((y) => y.name === x.name)).map((x) => x.name)];
              if (names.length === 0) return null;
              return (
                <div key={k} style={{ marginBottom: 20 }}>
                  <p style={{ ...poppins, fontSize: 11, fontWeight: 700, color: 'var(--accent, #3DDCC8)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>
                    {labelFor(k)}
                  </p>
                  {names.map((name) => {
                    const ka = kpisA.find((x) => x.name === name);
                    const kb = kpisB.find((x) => x.name === name);
                    return (
                      <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 64px', gap: 16, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ ...poppins, fontSize: 13, color: 'var(--text-primary)' }}>{name}</span>
                        {([ka, kb] as const).map((kpi, i) => (
                          <span key={i} className="font-bebas" style={{ fontSize: 18, textAlign: 'right', fontFeatureSettings: '"tnum"', color: kpi ? BAND_COLOR[kpi.status] ?? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {kpi ? Math.round(kpi.score) : '—'}
                          </span>
                        ))}
                        <div style={{ textAlign: 'right' }}>
                          {ka && kb ? <DeltaChip delta={Math.round(kb.score) - Math.round(ka.score)} /> : <span style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)' }}>—</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {drivers.shared.every((k) => !(rowA.report.drivers[k].sub_kpis?.length || rowB.report.drivers[k].sub_kpis?.length)) && (
              <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)' }}>Neither analysis contains sub-KPIs.</p>
            )}
            <p style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0' }}>
              <a href="/compare" style={{ color: 'var(--accent, #3DDCC8)' }}>Change selection</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: '36px 40px', ...poppins, fontSize: 14, color: 'var(--text-muted)' }}>Loading…</div>}>
      <CompareContent />
    </Suspense>
  );
}
