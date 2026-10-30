'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Download, ChevronDown, Loader2, AlertTriangle, BookOpen, Landmark, BarChart3 } from 'lucide-react';
import ScoreRing from '@/components/report/ScoreRing';
import DriverTiles from '@/components/report/DriverBars';
import DriverSection from '@/components/report/DriverSection';
import AttentionHeatmap from '@/components/report/AttentionHeatmap';
import SimilarCampaigns from '@/components/report/SimilarCampaigns';
import type { AttentionMetrics } from '@/lib/attention-types';
import OptimizeTab from '@/components/report/OptimizeTab';
import ProveTab from '@/components/report/ProveTab';
import { generatePPTX } from '@/components/report/pptx';
import { orderedDriverKeys, to100, band, BAND_COLOR, type Report } from '@/components/report/types';

interface Meta {
  clientId?: string | null;
  createdAt?: string;
  platforms?: string[];
  attentionMetrics?: AttentionMetrics | null;
}

type TabKey = 'predict' | 'optimize' | 'prove';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'predict', label: 'Predict' },
  { key: 'optimize', label: 'Optimize' },
  { key: 'prove', label: 'Prove' },
];

/** Inviting collapsed-section header: icon + label + count + chevron. */
function SectionToggle({
  icon, label, count, open, onToggle,
}: { icon: React.ReactNode; label: string; count?: number; open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-expanded={open} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
      <div className="glass" style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ display: 'flex', color: 'var(--accent)' }}>{icon}</span>
        <span style={{ flex: 1, fontFamily: 'var(--font-poppins)', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
          {typeof count === 'number' && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginLeft: 8 }}>{count}</span>
          )}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
          <ChevronDown size={16} color="var(--text-muted)" />
        </motion.span>
      </div>
    </button>
  );
}

/** Staggered fade-up wrapper for the overview sections (respects prefers-reduced-motion). */
function Stage({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reduced ? 0 : delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [meta, setMeta] = useState<Meta>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('predict');
  const [downloading, setDownloading] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showDeeper, setShowDeeper] = useState(false);
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
          attentionMetrics: row.intake?.attention_metrics?.heatmap_data_url ? row.intake.attention_metrics : null,
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

  const driverKeys = useMemo(() => orderedDriverKeys(report?.drivers), [report]);

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

  // ── Loading state: skeleton ring + tiles ─────────────────────────
  if (!report) {
    return (
      <div style={{ padding: '36px 40px', maxWidth: 1100 }} aria-busy="true" aria-label="Loading report">
        <div className="glass" style={{ padding: '32px 36px', display: 'flex', gap: 36, alignItems: 'center', marginBottom: 24 }}>
          <div className="shimmer-text" style={{ width: 150, height: 150, borderRadius: '50%', border: '9px solid var(--border-subtle)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="shimmer-text" style={{ height: 24, width: '45%', borderRadius: 6, background: 'var(--border-subtle)', marginBottom: 14 }} />
            <div className="shimmer-text" style={{ height: 13, width: '70%', borderRadius: 6, background: 'var(--border-subtle)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass" style={{ padding: '16px 18px' }}>
              <div className="shimmer-text" style={{ height: 10, width: '55%', borderRadius: 4, background: 'var(--border-subtle)', marginBottom: 12 }} />
              <div className="shimmer-text" style={{ height: 4, borderRadius: 99, background: 'var(--border-subtle)' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const score100 = to100(report.overall_score);
  const scoreColor = BAND_COLOR[band(score100)];
  const date = meta.createdAt ? new Date(meta.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const calibrated = report.calibration_context?.used === true;
  const topThree = (report.top_recommendations ?? []).slice(0, 3);

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

      {/* ── STAGE 1 · Overview: score, grade, one-sentence verdict ── */}
      <Stage>
        <div ref={headerRef} className="glass" style={{ padding: '36px 40px', marginBottom: 16, display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          <ScoreRing score100={score100} size={150} />
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 className="font-bebas" style={{ fontSize: 32, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1.05, margin: '0 0 10px' }}>
              {report.campaignName || 'CAMPAIGN REPORT'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {report.grade && (
                <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700, color: scoreColor, background: `${scoreColor}1a`, padding: '3px 12px', borderRadius: 99 }}>
                  {report.grade}
                </span>
              )}
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
              {calibrated && (
                <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3DDCC8', background: 'rgba(61,220,200,0.10)', border: '1px solid rgba(61,220,200,0.3)', padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Calibrated · {report.calibration_context?.campaign_count ?? ''} past
                </span>
              )}
              {date && <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)' }}>{date}</span>}
            </div>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55, margin: '0 0 18px', maxWidth: 640, borderLeft: `3px solid ${scoreColor}`, paddingLeft: 14 }}>
              {report.verdict}
            </p>
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
      </Stage>

      {/* ── STAGE 1b · Top 3 fixes: three clean cards ── */}
      {topThree.length > 0 && (
        <Stage delay={0.1}>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>
            Fix these first
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`, gap: 12, marginBottom: 48 }}>
            {topThree.map((rec, i) => (
              <div key={i} className="glass" style={{ padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span className="font-bebas" style={{ fontSize: 28, color: 'var(--accent)', lineHeight: 1, flexShrink: 0 }}>{i + 1}</span>
                <p style={{
                  fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: 'var(--text-primary)', margin: 0, lineHeight: 1.55,
                  display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </Stage>
      )}

      {/* ── Predict / Optimize / Prove tabs ── */}
      <Stage delay={0.18}>
        <div role="tablist" aria-label="Report sections" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
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
      </Stage>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 'predict' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* ── STAGE 2 · Driver tiles: click one to open ONLY that driver ── */}
              <div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px' }}>
                  {driverKeys.length === 3 ? 'The 3 lenses · tap one to see why' : 'The 6 drivers · tap one to see why'}
                </p>
                <DriverTiles drivers={report.drivers} keys={driverKeys} selected={selectedDriver} onSelect={setSelectedDriver} />
              </div>

              {/* Focused driver detail — only the selected one, never all at once */}
              <AnimatePresence mode="wait">
                {selectedDriver && report.drivers[selectedDriver] && (
                  <motion.div
                    key={selectedDriver}
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}
                  >
                    <DriverSection driverKey={selectedDriver} driver={report.drivers[selectedDriver]} />
                    {selectedDriver === 'attention' && meta.attentionMetrics && (
                      <AttentionHeatmap metrics={meta.attentionMetrics} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <SimilarCampaigns items={(report as any).similar_past_campaigns} />

              {/* ── STAGE 3 · Depth behind inviting toggles ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(report.executive_summary || report.creative_critique || report.audience_analysis || (report.platform_analysis?.length ?? 0) > 0) && (
                  <div>
                    <SectionToggle icon={<BookOpen size={16} />} label="Deeper analysis — summary, critique, audience & platforms" open={showDeeper} onToggle={() => setShowDeeper(!showDeeper)} />
                    <AnimatePresence>
                      {showDeeper && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>

                            {report.executive_summary && (
                              <div className="glass" style={{ padding: '24px 28px', borderLeft: `3px solid ${scoreColor}` }}>
                                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Executive summary</p>
                                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                                  {report.executive_summary}
                                </p>
                              </div>
                            )}

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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Comparable campaigns (collapsed) */}
                {(report.comparable_campaigns?.length ?? 0) > 0 && (
                  <div>
                    <SectionToggle icon={<Landmark size={16} />} label="Comparable Campaigns" count={report.comparable_campaigns!.length} open={showComparables} onToggle={() => setShowComparables(!showComparables)} />
                    <AnimatePresence>
                      {showComparables && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                          <div style={{ paddingTop: 12 }}>
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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Industry benchmarks (collapsed) */}
                {report.industry_benchmarks && (
                  <div>
                    <SectionToggle icon={<BarChart3 size={16} />} label="Industry Benchmarks" open={showBenchmarks} onToggle={() => setShowBenchmarks(!showBenchmarks)} />
                    <AnimatePresence>
                      {showBenchmarks && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                          <div style={{ paddingTop: 12 }}>
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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
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
