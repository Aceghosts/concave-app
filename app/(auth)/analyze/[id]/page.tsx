'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react';
import ScoreRing from '@/components/report/ScoreRing';
import DriverBars from '@/components/report/DriverBars';
import DriverSection from '@/components/report/DriverSection';
import OptimizeTab from '@/components/report/OptimizeTab';
import ProveTab from '@/components/report/ProveTab';
import { generatePPTX } from '@/components/report/pptx';
import { DRIVER_KEYS, to100, band, BAND_COLOR, type Report } from '@/components/report/types';

interface Meta {
  clientId?: string | null;
  createdAt?: string;
  platforms?: string[];
}

type TabKey = 'predict' | 'optimize' | 'prove';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'predict', label: 'Predict' },
  { key: 'optimize', label: 'Optimize' },
  { key: 'prove', label: 'Prove' },
];

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [meta, setMeta] = useState<Meta>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('predict');
  const [downloading, setDownloading] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [showComparables, setShowComparables] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    setLoadError(null);
    setReport(null);
    fetch(`/api/analyses?id=${id}`)
      .then(async r => {
        const row = await r.json();
        if (!r.ok || row.error) throw new Error(row.error || `Request failed (${r.status})`);
        return row;
      })
      .then(row => {
        setMeta({
          clientId: row.client_id,
          createdAt: row.created_at,
          platforms: Array.isArray(row.intake?.platforms) ? row.intake.platforms : undefined,
        });
        setReport({ id: row.id, campaignName: row.campaign_name, ...row.report });
      })
      .catch(err => setLoadError(err instanceof Error ? err.message : String(err)));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Sticky condensed header once the full header scrolls out
  useEffect(() => {
    const el = headerRef.current;
    if (!el || !report) return;
    const obs = new IntersectionObserver(([e]) => setCondensed(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [report]);

  function scrollToDriver(key: string) {
    setTab('predict');
    requestAnimationFrame(() => document.getElementById(`driver-${key}`)?.scrollIntoView({ behavior: 'smooth' }));
  }

  async function handleDownload() {
    if (!report) return;
    setDownloading(true);
    try { await generatePPTX(report); } finally { setDownloading(false); }
  }

  // ── Error state: the real error, loudly, with retry ──────────────
  if (loadError) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div className="glass" style={{ maxWidth: 560, padding: '32px 36px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <AlertTriangle size={18} color="#EF4444" />
            <h1 style={{ fontFamily: 'var(--font-poppins)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Couldn&apos;t load this report
            </h1>
          </div>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 18px', wordBreak: 'break-word' }}>
            {loadError}
          </p>
          <button className="btn-secondary" onClick={load}>Retry</button>
        </div>
      </div>
    );
  }

  // ── Loading state: skeleton ring + bars ──────────────────────────
  if (!report) {
    return (
      <div style={{ padding: '36px 40px', maxWidth: 1100 }} aria-busy="true" aria-label="Loading report">
        <div className="glass" style={{ padding: '32px 36px', display: 'flex', gap: 36, alignItems: 'center', marginBottom: 20 }}>
          <div className="shimmer-text" style={{ width: 120, height: 120, borderRadius: '50%', border: '8px solid var(--border-subtle)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="shimmer-text" style={{ height: 22, width: '45%', borderRadius: 6, background: 'var(--border-subtle)', marginBottom: 12 }} />
            <div className="shimmer-text" style={{ height: 13, width: '70%', borderRadius: 6, background: 'var(--border-subtle)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          {DRIVER_KEYS.map(k => (
            <div key={k}>
              <div className="shimmer-text" style={{ height: 10, width: '60%', borderRadius: 4, background: 'var(--border-subtle)', marginBottom: 8 }} />
              <div className="shimmer-text" style={{ height: 5, borderRadius: 99, background: 'var(--border-subtle)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const score100 = to100(report.overall_score);
  const scoreColor = BAND_COLOR[band(score100)];
  const date = meta.createdAt ? new Date(meta.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100 }}>
      {/* ── Condensed sticky header ── */}
      <AnimatePresence>
        {condensed && (
          <motion.div
            initial={{ y: -56, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -56, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="glass"
            style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', alignItems: 'center', gap: 16, padding: '8px 18px', borderRadius: 99 }}
          >
            <span className="font-bebas" style={{ fontSize: 24, color: scoreColor, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{score100}</span>
            <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {report.campaignName || 'Campaign Analysis'}
            </span>
            <button className="btn-primary" onClick={handleDownload} disabled={downloading} style={{ padding: '6px 14px', fontSize: 12 }}>
              {downloading ? <Loader2 size={13} className="spin" /> : <Download size={13} />} PPTX
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Score header ── */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="glass"
        style={{ padding: '28px 32px', marginBottom: 20, display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <ScoreRing score100={score100} />
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 className="font-bebas" style={{ fontSize: 34, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1.05, margin: '0 0 6px' }}>
            {report.campaignName || 'CAMPAIGN REPORT'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {meta.clientId && (
              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '3px 10px', borderRadius: 99 }}>
                {meta.clientId}
              </span>
            )}
            {(meta.platforms || []).map(p => (
              <span key={p} style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', padding: '3px 10px', borderRadius: 99 }}>
                {p}
              </span>
            ))}
            {date && <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)' }}>{date}</span>}
            {report.grade && <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: scoreColor }}>{report.grade}</span>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={handleDownload} disabled={downloading}
              className="btn-primary" style={{ opacity: downloading ? 0.8 : 1, minWidth: 150 }}
            >
              {downloading ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
              {downloading ? 'Generating...' : 'Export PPTX'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Six driver bars ── */}
      <div className="glass" style={{ padding: '22px 26px', marginBottom: 20 }}>
        <DriverBars drivers={report.drivers} onSelect={scrollToDriver} />
      </div>

      {/* ── Predict / Optimize / Prove tabs ── */}
      <div role="tablist" aria-label="Report sections" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={active ? undefined : 'glass'}
              style={{
                fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                padding: '9px 22px', borderRadius: 99, border: '1px solid',
                borderColor: active ? 'var(--accent)' : 'var(--glass-border)',
                background: active ? 'var(--accent-dim)' : undefined,
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'predict' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Executive summary */}
              <div className="glass" style={{ padding: '26px 30px', borderLeft: `4px solid ${scoreColor}` }}>
                {report.executive_summary && (
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>
                    {report.executive_summary}
                  </p>
                )}
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>
                  {report.verdict}
                </p>
              </div>

              {DRIVER_KEYS.map(key => report.drivers[key] && (
                <DriverSection key={key} driverKey={key} driver={report.drivers[key]} />
              ))}

              {/* Creative critique */}
              {report.creative_critique && (
                <div className="glass" style={{ padding: '24px 28px' }}>
                  <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Creative Critique</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {[
                      { label: 'Concept Strength', key: 'concept_strength' },
                      { label: 'Execution Quality', key: 'execution_quality' },
                      { label: 'Copy Analysis', key: 'copy_analysis' },
                      { label: 'Visual Analysis', key: 'visual_analysis' },
                      { label: 'Format Analysis', key: 'format_analysis' },
                    ].map(({ label, key }) => report.creative_critique?.[key] && (
                      <div key={key} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{label}</p>
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>{report.creative_critique?.[key]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audience + platform */}
              {(report.audience_analysis || (report.platform_analysis?.length ?? 0) > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                  {report.audience_analysis && (
                    <div className="glass" style={{ padding: '24px 28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>Audience Analysis</h2>
                      {[
                        { label: 'Audience Fit', key: 'audience_fit' },
                        { label: 'Cultural Relevance', key: 'cultural_relevance' },
                        { label: 'Psychographic Alignment', key: 'psychographic_alignment' },
                      ].map(({ label, key }) => report.audience_analysis?.[key] && (
                        <div key={key} style={{ marginBottom: 12 }}>
                          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</p>
                          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>{report.audience_analysis?.[key]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {(report.platform_analysis?.length ?? 0) > 0 && (
                    <div className="glass" style={{ padding: '24px 28px' }}>
                      <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>Platform Analysis</h2>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {report.platform_analysis!.map((p: any, i: number) => {
                        const ps = Math.round((p.fit_score ?? 0) * 10);
                        const pc = BAND_COLOR[band(ps)];
                        return (
                          <div key={i} style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{p.platform}</span>
                              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: `${pc}1f`, color: pc }}>{ps}/100</span>
                            </div>
                            {p.algorithm_considerations && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: '0 0 5px', lineHeight: 1.55 }}>{p.algorithm_considerations}</p>}
                            {p.format_recommendations && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 5px', lineHeight: 1.55 }}><strong style={{ color: 'var(--text-muted)' }}>Format: </strong>{p.format_recommendations}</p>}
                            {p.expected_performance && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}><strong style={{ color: 'var(--text-muted)' }}>Prognosis: </strong>{p.expected_performance}</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Comparable campaigns (collapsed) */}
              {(report.comparable_campaigns?.length ?? 0) > 0 && (
                <div>
                  <button onClick={() => setShowComparables(!showComparables)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: showComparables ? 12 : 0 }} aria-expanded={showComparables}>
                    <div className="glass" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        Comparable Campaigns <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginLeft: 6 }}>{report.comparable_campaigns!.length}</span>
                      </h2>
                      {showComparables ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {showComparables && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {report.comparable_campaigns!.map((camp: any, i: number) => (
                          <div key={i} className="glass" style={{ padding: '22px 26px', marginBottom: 10 }}>
                            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>{camp.name}</p>
                            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px' }}>{camp.brand} · {camp.platform} · {camp.year}</p>
                            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>{camp.concept}</p>
                            {camp.relevance && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 10px' }}><strong>Why comparable: </strong>{camp.relevance}</p>}
                            {camp.lesson && (
                              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, background: 'var(--accent-dim)', borderLeft: '3px solid var(--accent)', borderRadius: 8, padding: '10px 14px' }}>
                                {camp.lesson}
                              </p>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Industry benchmarks (collapsed) */}
              {report.industry_benchmarks && (
                <div>
                  <button onClick={() => setShowBenchmarks(!showBenchmarks)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: showBenchmarks ? 12 : 0 }} aria-expanded={showBenchmarks}>
                    <div className="glass" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Industry Benchmarks</h2>
                      {showBenchmarks ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {showBenchmarks && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                        {(report.industry_benchmarks.context || report.industry_benchmarks.overall_insight) && (
                          <div className="glass" style={{ padding: '18px 22px', marginBottom: 10, borderLeft: '3px solid var(--accent)' }}>
                            {report.industry_benchmarks.context && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 8px' }}>{report.industry_benchmarks.context}</p>}
                            {report.industry_benchmarks.overall_insight && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>{report.industry_benchmarks.overall_insight}</p>}
                          </div>
                        )}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(report.industry_benchmarks.platform_benchmarks || []).map((pb: any, i: number) => (
                          <div key={i} className="glass" style={{ padding: '18px 22px', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '3px 10px', borderRadius: 99 }}>{pb.platform}</span>
                              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)' }}>{pb.industry}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginBottom: 10 }}>
                              {[
                                { label: 'Avg CTR', value: pb.avg_ctr },
                                { label: 'Avg CPM', value: pb.avg_cpm },
                                { label: 'Avg Engagement', value: pb.avg_engagement },
                                { label: 'Video View', value: pb.avg_video_view },
                              ].filter(m => m.value).map(m => (
                                <div key={m.label} style={{ background: 'var(--accent-dim)', border: '1px solid rgba(61,220,200,0.12)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{m.label}</p>
                                  <p className="font-bebas" style={{ fontSize: 18, color: 'var(--accent)', margin: 0, lineHeight: 1 }}>{m.value}</p>
                                </div>
                              ))}
                            </div>
                            {pb.what_it_means && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{pb.what_it_means}</p>}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {tab === 'optimize' && <OptimizeTab report={report} />}
          {tab === 'prove' && <ProveTab report={report} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Footer actions ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, marginBottom: 40 }}>
        <button className="btn-primary" onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
          {downloading ? 'Generating...' : 'Export PPTX'}
        </button>
      </div>
    </div>
  );
}
