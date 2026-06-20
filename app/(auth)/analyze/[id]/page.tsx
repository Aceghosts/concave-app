'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, ChevronDown, ChevronUp, ArrowRight, Loader2 } from 'lucide-react';
import CountUp from '@/components/CountUp';

const DEMO_REPORT = {
  overall_score: 7.8,
  verdict: "This campaign has strong emotional hooks and clear brand alignment, but risks losing impact on mobile due to text density. The concept is culturally resonant and platform-appropriate — with tighter creative execution it could be exceptional.",
  top_recommendations: [
    "Cut the body copy by 40% — lead with the visual, let it breathe",
    "Add a stronger CTA in the first 3 seconds for Reels/Stories format",
    "Test a culturally-specific variant for the KSA audience segment",
  ],
  drivers: {
    attention: { score: 8.5, summary: "High-contrast visual with motion in first frame", justification: "The hero visual leads with movement and color contrast that would stop a thumb mid-scroll. The color palette is distinctive and ownable. One risk: the opening 1.5 seconds need the brand mark visible, which currently appears at 4s.", what_works: ["Strong visual contrast", "Motion in first frame", "Distinctive color palette"], what_doesnt: ["Brand mark delayed to 4 seconds", "Text overlay competes with visual"], recommendations: ["Move brand mark to 0–2s window", "Reduce text overlay opacity by 20%"] },
    branding: { score: 7.2, summary: "Brand cues are present but could be stronger", justification: "Logo placement is correct but the brand voice in copy doesn't fully match the established tone. The visual language is on-brand but could be pushed further with signature brand elements.", what_works: ["Logo placement is correct", "Brand colors consistent"], what_doesnt: ["Copy tone doesn't match brand voice guidelines", "Signature visual elements underutilized"], recommendations: ["Align copy tone with brand voice document", "Incorporate signature brand motion element"] },
    processing_ease: { score: 6.8, summary: "Message is clear but text-heavy on mobile", justification: "The core message lands in under 3 seconds when viewed on desktop, but mobile users face a text density problem. The hierarchy is logical but the number of messages competes for attention.", what_works: ["Clear headline hierarchy", "Logical message flow"], what_doesnt: ["Too much body text for mobile", "Three competing sub-messages"], recommendations: ["One headline, one CTA — cut everything else", "Test mobile-first version with 60% less text"] },
    strategic_fit: { score: 8.1, summary: "Excellent alignment with goal and platform", justification: "The creative approach is well-matched to the brand awareness objective and the Meta/Instagram environment. The format choices — Reels-first, Stories secondary — are appropriate for the target demographic.", what_works: ["Format matches platform best practices", "Demographic targeting is precise"], what_doesnt: ["Budget allocation could lean heavier into Reels"], recommendations: ["Shift 70% of budget to Reels placements", "Create a TikTok-native variant"] },
    emotional_engagement: { score: 8.9, summary: "Genuine emotional resonance with target audience", justification: "The cultural references land authentically and the emotional arc of the creative builds correctly. Research suggests this type of emotional appeal outperforms rational messaging 2:1 in this category.", what_works: ["Authentic cultural references", "Emotional arc builds correctly", "Music choice reinforces mood"], what_doesnt: ["Emotional peak comes too late (8s in)"], recommendations: ["Move emotional peak to 3–4s mark"] },
    persuasion: { score: 7.3, summary: "Clear call-to-action but conversion path is long", justification: "The CTA is present and contextually appropriate, but the journey from ad to conversion has too many steps. Shortening the path or using a lead form would significantly improve conversion rates.", what_works: ["CTA is contextually appropriate", "Offer is compelling"], what_doesnt: ["Conversion path has 3+ steps", "No urgency signal"], recommendations: ["Use Meta Lead Form to capture interest in-app", "Add urgency signal (limited time, limited spots)"] },
  },
  comparable_campaigns: [
    { name: "You Can't Stop Us", brand: "Nike", platform: "YouTube / Meta", year: "2020", concept: "Split-screen athletes from different sports sharing identical movements — a visual metaphor for unity under pressure. The technique made the brand message inseparable from the creative execution.", metrics: { views: "80M+", shares: "2.1M", engagement: "12.4%", sales_impact: "+18%", earned_media: "$50M+" }, relevance: "Same emotional-first strategy targeting a broad audience through shared human experience. Ran on Meta with a Reels-native cut that outperformed the long-form version.", lesson: "Use visual technique as a metaphor for your message, not just decoration. When form and content are unified, the campaign becomes unforgettable." },
  ],
  industry_benchmarks: {
    context: "Benchmarks are based on Meta and Instagram performance data for the Automotive industry in the MENA region, specifically targeting the 25–45 demographic on Reels and Stories placements.",
    overall_insight: "Automotive campaigns in MENA typically see lower CTR than retail but higher engagement when culturally resonant content is used. Your campaign's emotional approach aligns with the top-quartile performers in this category.",
    platform_benchmarks: [
      { platform: "Instagram Reels", industry: "Automotive – MENA", avg_ctr: "1.2%", avg_cpm: "$4.80", avg_engagement: "5.3%", avg_video_view: "38%", what_it_means: "Your Reels-first approach is on strategy. Top performers in this space exceed 7% engagement — achievable if you move the emotional hook to the first 2 seconds." },
      { platform: "Instagram Stories", industry: "Automotive – MENA", avg_ctr: "0.8%", avg_cpm: "$3.60", avg_engagement: "3.1%", what_it_means: "Stories convert better with a direct CTA overlay. Without one, expect to land near the category average of 0.8% CTR." },
    ],
  },
};

function scoreColor(score: number) {
  if (score >= 8) return '#3EB489';
  if (score >= 6) return '#F59E0B';
  return '#EF4444';
}

function scoreBadge(score: number) {
  if (score >= 9) return { label: 'Exceptional', color: '#3EB489' };
  if (score >= 7.5) return { label: 'Strong', color: '#3EB489' };
  if (score >= 6) return { label: 'Good', color: '#F59E0B' };
  if (score >= 4) return { label: 'Moderate', color: '#F59E0B' };
  return { label: 'Weak', color: '#EF4444' };
}

const DRIVER_KEYS = ['attention', 'branding', 'processing_ease', 'strategic_fit', 'emotional_engagement', 'persuasion'];
const DRIVER_LABELS: Record<string, string> = {
  attention: 'ATTENTION',
  branding: 'BRANDING',
  processing_ease: 'PROCESSING EASE',
  strategic_fit: 'STRATEGIC FIT',
  emotional_engagement: 'EMOTIONAL ENGAGEMENT',
  persuasion: 'PERSUASION',
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generatePPTX(report: any) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_WIDE';

  const BG   = '0A0F1E';
  const ACC  = '3EB489';
  const WHITE = 'F1F5F9';
  const MUTED = '5E7A8F';

  // ── Slide 1: Cover ──────────────────────────────────────────────
  const s1 = prs.addSlide();
  s1.background = { color: BG };
  s1.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: ACC } });
  s1.addText('CONCAVE', { x: 0.4, y: 0.5, w: 12, h: 0.8, fontSize: 14, fontFace: 'Arial Narrow', bold: true, color: ACC, charSpacing: 6 });
  s1.addText('CAMPAIGN\nREPORT', { x: 0.4, y: 1.4, w: 9, h: 2.6, fontSize: 72, fontFace: 'Arial Narrow', bold: true, color: WHITE, lineSpacingMultiple: 0.85 });
  s1.addText(report.campaignName || 'Campaign Analysis', { x: 0.4, y: 4.2, w: 9, h: 0.4, fontSize: 16, fontFace: 'Calibri', color: MUTED });
  s1.addText(`Overall Score`, { x: 0.4, y: 5.2, w: 3, h: 0.35, fontSize: 11, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 3 });
  s1.addText(`${report.overall_score}/10`, { x: 0.4, y: 5.6, w: 4, h: 1.2, fontSize: 80, fontFace: 'Arial Narrow', bold: true, color: ACC });

  // ── Slide 2: Executive Summary ───────────────────────────────────
  const s2 = prs.addSlide();
  s2.background = { color: BG };
  s2.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: ACC } });
  s2.addText('EXECUTIVE SUMMARY', { x: 0.4, y: 0.4, w: 12, h: 0.5, fontSize: 28, fontFace: 'Arial Narrow', bold: true, color: WHITE, charSpacing: 3 });
  s2.addText(report.verdict, { x: 0.4, y: 1.2, w: 12.2, h: 1.6, fontSize: 13, fontFace: 'Calibri', color: 'A8BCCF', lineSpacingMultiple: 1.4 });
  s2.addText('TOP RECOMMENDATIONS', { x: 0.4, y: 3.0, w: 12, h: 0.35, fontSize: 10, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 3 });
  report.top_recommendations.forEach((rec: string, i: number) => {
    s2.addShape(prs.ShapeType.ellipse, { x: 0.4, y: 3.55 + i * 0.75, w: 0.28, h: 0.28, fill: { color: ACC } });
    s2.addText(`${i + 1}`, { x: 0.4, y: 3.53 + i * 0.75, w: 0.28, h: 0.28, fontSize: 9, fontFace: 'Calibri', bold: true, color: '000000', align: 'center', valign: 'middle' });
    s2.addText(rec, { x: 0.8, y: 3.52 + i * 0.75, w: 11.8, h: 0.5, fontSize: 13, fontFace: 'Calibri', color: WHITE });
  });

  // ── Slide 3: Score Grid ──────────────────────────────────────────
  const s3 = prs.addSlide();
  s3.background = { color: BG };
  s3.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: ACC } });
  s3.addText('DRIVER SCORES', { x: 0.4, y: 0.4, w: 12, h: 0.5, fontSize: 28, fontFace: 'Arial Narrow', bold: true, color: WHITE, charSpacing: 3 });

  const cols = 3;
  DRIVER_KEYS.forEach((key, idx) => {
    const driver = report.drivers[key];
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = 0.4 + col * 4.3;
    const y = 1.2 + row * 2.8;
    const c = driver.score >= 8 ? ACC : driver.score >= 6 ? 'F59E0B' : 'EF4444';

    s3.addShape(prs.ShapeType.rect, { x, y, w: 4.0, h: 2.4, fill: { color: '0D1320' }, line: { color: c, width: 1.5 } });
    s3.addShape(prs.ShapeType.rect, { x, y, w: 0.05, h: 2.4, fill: { color: c } });
    s3.addText(DRIVER_LABELS[key], { x: x + 0.15, y: y + 0.18, w: 3.7, h: 0.3, fontSize: 8, fontFace: 'Calibri', bold: true, color: c, charSpacing: 2 });
    s3.addText(`${driver.score}`, { x: x + 0.15, y: y + 0.5, w: 2, h: 0.9, fontSize: 52, fontFace: 'Arial Narrow', bold: true, color: c });
    s3.addText('/10', { x: x + 1.1, y: y + 1.1, w: 1, h: 0.35, fontSize: 14, fontFace: 'Calibri', color: MUTED });
    s3.addText(driver.summary, { x: x + 0.15, y: y + 1.55, w: 3.7, h: 0.7, fontSize: 9, fontFace: 'Calibri', color: MUTED, lineSpacingMultiple: 1.3 });
  });

  // ── Slides 4–9: One per driver ───────────────────────────────────
  DRIVER_KEYS.forEach((key) => {
    const driver = report.drivers[key];
    const c = driver.score >= 8 ? ACC : driver.score >= 6 ? 'F59E0B' : 'EF4444';
    const sd = prs.addSlide();
    sd.background = { color: BG };
    sd.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: c } });
    sd.addText(DRIVER_LABELS[key], { x: 0.4, y: 0.35, w: 10, h: 0.4, fontSize: 11, fontFace: 'Calibri', bold: true, color: c, charSpacing: 3 });
    sd.addText(`${driver.score}/10`, { x: 0.4, y: 0.8, w: 5, h: 1.1, fontSize: 64, fontFace: 'Arial Narrow', bold: true, color: c });
    sd.addText(driver.summary, { x: 0.4, y: 1.95, w: 12.2, h: 0.4, fontSize: 13, fontFace: 'Calibri', italic: true, color: MUTED });
    sd.addText(driver.deep_analysis || driver.justification || '', { x: 0.4, y: 2.5, w: 12.2, h: 1.4, fontSize: 12, fontFace: 'Calibri', color: 'A8BCCF', lineSpacingMultiple: 1.4 });

    sd.addText('WHAT WORKS', { x: 0.4, y: 4.05, w: 6, h: 0.3, fontSize: 9, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 2 });
    driver.what_works.forEach((w: string, i: number) => {
      sd.addText(`✓  ${w}`, { x: 0.4, y: 4.45 + i * 0.38, w: 5.8, h: 0.35, fontSize: 11, fontFace: 'Calibri', color: WHITE });
    });
    sd.addText("WHAT DOESN'T", { x: 6.8, y: 4.05, w: 6, h: 0.3, fontSize: 9, fontFace: 'Calibri', bold: true, color: 'EF4444', charSpacing: 2 });
    driver.what_doesnt.forEach((w: string, i: number) => {
      sd.addText(`✗  ${w}`, { x: 6.8, y: 4.45 + i * 0.38, w: 5.8, h: 0.35, fontSize: 11, fontFace: 'Calibri', color: WHITE });
    });

    sd.addText('RECOMMENDATIONS', { x: 0.4, y: 5.9, w: 12, h: 0.3, fontSize: 9, fontFace: 'Calibri', bold: true, color: ACC, charSpacing: 2 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    driver.recommendations.forEach((r: any, i: number) => {
      const text = typeof r === 'string' ? r : `[${r.priority}] ${r.action}`;
      sd.addText(`→  ${text}`, { x: 0.4, y: 6.28 + i * 0.38, w: 12.2, h: 0.35, fontSize: 11, fontFace: 'Calibri', color: WHITE });
    });
  });

  // ── Slide 10: Thank you ──────────────────────────────────────────
  const sEnd = prs.addSlide();
  sEnd.background = { color: BG };
  sEnd.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: ACC } });
  sEnd.addText('CONCAVE', { x: 0.4, y: 0.5, w: 12, h: 0.6, fontSize: 14, fontFace: 'Arial Narrow', bold: true, color: ACC, charSpacing: 6 });
  sEnd.addText('PREPARED\nFOR YOU.', { x: 0.4, y: 1.8, w: 10, h: 3.0, fontSize: 72, fontFace: 'Arial Narrow', bold: true, color: WHITE, lineSpacingMultiple: 0.85 });
  sEnd.addText('Campaign Analysis by Concave AI', { x: 0.4, y: 5.2, w: 10, h: 0.4, fontSize: 13, fontFace: 'Calibri', color: MUTED });

  await prs.writeFile({ fileName: 'Concave-Campaign-Report.pptx' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Report = typeof DEMO_REPORT & { campaignName?: string; [k: string]: any };

export default function ReportPage() {
  const params = useParams();
  const id = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);
  const [showComparables, setShowComparables] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id === 'demo-report') {
      setReport(DEMO_REPORT as Report);
      return;
    }
    const stored = localStorage.getItem(`report:${id}`);
    if (stored) {
      setReport(JSON.parse(stored));
    } else {
      setReport(DEMO_REPORT as Report);
    }
  }, [id]);

  if (!report) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="shimmer-text font-bebas" style={{ fontSize: 32, letterSpacing: 1 }}>LOADING report...</div>
      </div>
    );
  }

  const badge = scoreBadge(report.overall_score);

  async function handleDownload() {
    setDownloading(true);
    try {
      await generatePPTX(report);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            {report.campaignName || 'Campaign Analysis'}
          </p>
          <h1 className="font-bebas" style={{ fontSize: 36, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1 }}>
            CAMPAIGN REPORT
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-secondary"
          >
            <RefreshCw size={14} /> Re-analyze
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary"
            style={{ opacity: downloading ? 0.8 : 1, minWidth: 160 }}
          >
            {downloading ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
            {downloading ? 'Generating...' : 'Download PPTX'}
          </motion.button>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass"
        style={{ padding: '32px 36px', marginBottom: 20, borderLeft: `4px solid ${scoreColor(report.overall_score)}` }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 36 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="font-bebas" style={{ fontSize: 80, lineHeight: 1, color: scoreColor(report.overall_score), letterSpacing: 0 }}>
              <CountUp target={report.overall_score} decimals={1} duration={1.8} />
            </div>
            <div style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>/10</div>
            <span style={{
              fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600,
              color: badge.color, background: `${badge.color}18`,
              padding: '5px 14px', borderRadius: 20,
            }}>
              {badge.label}
            </span>
          </div>

          <div>
            {report.executive_summary && (
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>
                {report.executive_summary}
              </p>
            )}
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.7, margin: '0 0 20px', borderLeft: '3px solid #3EB489', paddingLeft: 12 }}>
              {report.verdict}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {report.top_recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3EB489', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Score Grid */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}
      >
        {DRIVER_KEYS.map((key, index) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const driver = (report.drivers as any)[key] as { score: number; summary: string; justification?: string; deep_analysis?: string; what_works: string[]; what_doesnt: string[]; recommendations: (string | { priority: string; action: string; rationale: string; effort: string })[]; benchmark_context?: string };
          const isExpanded = expandedDriver === key;
          const color = scoreColor(driver.score);

          return (
            <motion.div key={key} variants={cardVariants} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Score card — editorial style */}
              <motion.div
                whileHover={{ y: -3 }}
                onClick={() => setExpandedDriver(isExpanded ? null : key)}
                style={{
                  position: 'relative', overflow: 'hidden', cursor: 'pointer',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                  border: '1px solid var(--glass-border)',
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 18, padding: '20px 22px 18px',
                  boxShadow: 'var(--glass-shadow)',
                  transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
              >
                {/* Ghost score behind */}
                <span style={{
                  position: 'absolute', right: -4, top: -8,
                  fontFamily: 'var(--font-bebas)', fontSize: 110, lineHeight: 1,
                  color, opacity: 0.07, pointerEvents: 'none', userSelect: 'none',
                  letterSpacing: -2,
                }}>
                  {driver.score.toFixed(1)}
                </span>

                {/* Label row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                    {DRIVER_LABELS[key]}
                  </p>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} color="var(--text-muted)" />
                  </motion.div>
                </div>

                {/* Score */}
                <div className="font-bebas" style={{ fontSize: 46, color, lineHeight: 1, marginBottom: 8, letterSpacing: -1 }}>
                  <CountUp target={driver.score} decimals={1} />
                  <span style={{ fontSize: 18, color: 'var(--text-muted)', marginLeft: 3 }}>/10</span>
                </div>

                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.45 }}>
                  {driver.summary}
                </p>

                {/* Progress track */}
                <div style={{ height: 3, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${driver.score * 10}%` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18, delay: index * 0.09 }}
                    style={{ height: '100%', borderRadius: 99, background: color, boxShadow: `0 0 8px ${color}60` }}
                  />
                </div>
              </motion.div>

              {/* Expanded detail panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      marginTop: 6, padding: '22px 22px 20px',
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--glass-border)',
                      borderLeft: `3px solid ${color}`,
                      borderTop: 'none',
                      borderRadius: '0 0 16px 16px',
                    }}>
                      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 18 }}>
                        {driver.deep_analysis || driver.justification}
                      </p>

                      {/* Works / Doesn't side by side but with flex-wrap */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                        <div style={{ background: 'rgba(62,180,137,0.05)', border: '1px solid rgba(62,180,137,0.13)', borderRadius: 10, padding: '12px 14px' }}>
                          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3EB489', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Works</p>
                          {driver.what_works.map((w, i) => (
                            <p key={i} style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 5px', lineHeight: 1.4 }}>
                              <span style={{ color: '#3EB489', marginRight: 4 }}>✓</span>{w}
                            </p>
                          ))}
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.11)', borderRadius: 10, padding: '12px 14px' }}>
                          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Doesn&apos;t</p>
                          {driver.what_doesnt.map((w, i) => (
                            <p key={i} style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 5px', lineHeight: 1.4 }}>
                              <span style={{ color: '#EF4444', marginRight: 4 }}>✗</span>{w}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Recommendations</p>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {driver.recommendations.map((r: any, i: number) => (
                          <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                            {typeof r === 'string' ? (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <ArrowRight size={12} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
                                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{r}</p>
                              </div>
                            ) : (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                  <span style={{
                                    fontFamily: 'var(--font-poppins)', fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' as const, padding: '2px 7px', borderRadius: 99,
                                    background: r.priority === 'Critical' ? 'rgba(239,68,68,0.12)' : r.priority === 'High' ? 'rgba(245,158,11,0.12)' : 'rgba(62,180,137,0.1)',
                                    color: r.priority === 'Critical' ? '#EF4444' : r.priority === 'High' ? '#F59E0B' : '#3EB489',
                                  }}>{r.priority}</span>
                                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Effort: {r.effort}</span>
                                </div>
                                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.4 }}>{r.action}</p>
                                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{r.rationale}</p>
                              </>
                            )}
                          </div>
                        ))}
                        {driver.benchmark_context && (
                          <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(62,180,137,0.04)', border: '1px solid rgba(62,180,137,0.12)', borderRadius: 8 }}>
                            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3EB489', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 5 }}>Benchmark Context</p>
                            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{driver.benchmark_context}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Creative Critique */}
      {report.creative_critique && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ marginBottom: 20 }}>
          <div className="glass" style={{ padding: '28px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px' }}>Creative Critique</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Concept Strength', key: 'concept_strength' },
                { label: 'Execution Quality', key: 'execution_quality' },
                { label: 'Copy Analysis', key: 'copy_analysis' },
                { label: 'Visual Analysis', key: 'visual_analysis' },
                { label: 'Format Analysis', key: 'format_analysis' },
              ].map(({ label, key }) => report.creative_critique[key] && (
                <div key={key} style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3EB489', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>{report.creative_critique[key]}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Audience + Platform Analysis */}
      {(report.audience_analysis || report.platform_analysis?.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
          style={{ display: 'grid', gridTemplateColumns: report.platform_analysis?.length > 0 ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 20 }}>
          {report.audience_analysis && (
            <div className="glass" style={{ padding: '28px 32px' }}>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 18px' }}>Audience Analysis</h2>
              {[
                { label: 'Audience Fit', key: 'audience_fit' },
                { label: 'Cultural Relevance', key: 'cultural_relevance' },
                { label: 'Psychographic Alignment', key: 'psychographic_alignment' },
              ].map(({ label, key }) => report.audience_analysis[key] && (
                <div key={key} style={{ marginBottom: 14 }}>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3EB489', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>{report.audience_analysis[key]}</p>
                </div>
              ))}
            </div>
          )}
          {report.platform_analysis?.length > 0 && (
            <div className="glass" style={{ padding: '28px 32px' }}>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 18px' }}>Platform Analysis</h2>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {report.platform_analysis.map((p: any, i: number) => (
                <div key={i} style={{ marginBottom: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{p.platform}</span>
                    <span style={{
                      fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99,
                      background: p.fit_score >= 8 ? 'rgba(62,180,137,0.12)' : p.fit_score >= 6 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.1)',
                      color: p.fit_score >= 8 ? '#3EB489' : p.fit_score >= 6 ? '#F59E0B' : '#EF4444',
                    }}>{p.fit_score}/10</span>
                  </div>
                  {p.algorithm_considerations && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: 1.6 }}>{p.algorithm_considerations}</p>}
                  {p.format_recommendations && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.6 }}><strong style={{ color: 'var(--text-muted)' }}>Format: </strong>{p.format_recommendations}</p>}
                  {p.expected_performance && <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}><strong style={{ color: 'var(--text-muted)' }}>Prognosis: </strong>{p.expected_performance}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Risk Assessment */}
      {report.risk_assessment && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginBottom: 20 }}>
          <div className="glass" style={{ padding: '28px 32px', borderLeft: `4px solid ${report.risk_assessment.confidence_level === 'High' ? '#3EB489' : report.risk_assessment.confidence_level === 'Medium' ? '#F59E0B' : '#EF4444'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Risk Assessment</h2>
              <span style={{
                fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 99,
                background: report.risk_assessment.confidence_level === 'High' ? 'rgba(62,180,137,0.12)' : report.risk_assessment.confidence_level === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.1)',
                color: report.risk_assessment.confidence_level === 'High' ? '#3EB489' : report.risk_assessment.confidence_level === 'Medium' ? '#F59E0B' : '#EF4444',
              }}>Confidence: {report.risk_assessment.confidence_level}</span>
            </div>
            {report.risk_assessment.confidence_rationale && (
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 18px' }}>{report.risk_assessment.confidence_rationale}</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Primary Risks</p>
                {(report.risk_assessment.primary_risks || []).map((r: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }}>⚠</span>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{r}</p>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3EB489', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Mitigation Strategies</p>
                {(report.risk_assessment.mitigation_strategies || []).map((r: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: '#3EB489', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparable Campaigns */}
      {/* Comparable Campaigns */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginBottom: 12 }}>
        <button onClick={() => setShowComparables(!showComparables)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: showComparables ? 12 : 0 }}>
          <div className="glass" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Comparable Campaigns
              </h2>
              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 600, color: '#3EB489', background: 'rgba(62,180,137,0.1)', padding: '2px 8px', borderRadius: 99, letterSpacing: '0.5px' }}>
                {(report.comparable_campaigns || []).length} found
              </span>
            </div>
            {showComparables ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
          </div>
        </button>
        <AnimatePresence>
          {showComparables && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {(report.comparable_campaigns || []).map((camp: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass" style={{ padding: '28px', marginBottom: 12 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(62,180,137,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 700, color: '#3EB489' }}>{camp.brand[0]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{camp.name}</p>
                      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{camp.brand} · {camp.platform} · {camp.year}</p>
                    </div>
                  </div>

                  {/* Why relevant */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Why it&apos;s comparable</p>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{camp.relevance}</p>
                  </div>

                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{camp.concept}</p>

                  {/* Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Object.keys(camp.metrics || {}).length}, 1fr)`, gap: 10, marginBottom: 16 }}>
                    {Object.entries(camp.metrics as Record<string, string>).filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ background: 'rgba(62,180,137,0.05)', border: '1px solid rgba(62,180,137,0.12)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{k.replace(/_/g, ' ')}</p>
                        <p className="font-bebas" style={{ fontSize: 20, color: '#3EB489', margin: 0, lineHeight: 1 }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Lesson */}
                  <div style={{ background: 'rgba(62,180,137,0.05)', border: '1px solid rgba(62,180,137,0.15)', borderLeft: '3px solid #3EB489', borderRadius: 12, padding: '14px 16px' }}>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3EB489', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Lesson for your campaign</p>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{camp.lesson}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Industry Benchmarks */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ marginBottom: 40 }}>
        <button onClick={() => setShowBenchmarks(!showBenchmarks)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: showBenchmarks ? 12 : 0 }}>
          <div className="glass" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Industry Benchmarks
            </h2>
            {showBenchmarks ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
          </div>
        </button>
        <AnimatePresence>
          {showBenchmarks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* Context + overall insight */}
              <div className="glass" style={{ padding: '20px 24px', marginBottom: 12, borderLeft: '3px solid #3EB489' }}>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3EB489', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Context</p>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>
                  {report.industry_benchmarks?.context}
                </p>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                  {report.industry_benchmarks?.overall_insight}
                </p>
              </div>

              {/* Per-platform benchmark cards */}
              {(report.industry_benchmarks?.platform_benchmarks || []).map((pb: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass" style={{ padding: '24px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: '#3EB489', background: 'rgba(62,180,137,0.1)', padding: '3px 10px', borderRadius: 99, letterSpacing: '0.5px' }}>
                      {pb.platform}
                    </span>
                    <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)' }}>{pb.industry}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: pb.avg_video_view ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                      { label: 'Avg CTR', value: pb.avg_ctr },
                      { label: 'Avg CPM', value: pb.avg_cpm },
                      { label: 'Avg Engagement', value: pb.avg_engagement },
                      ...(pb.avg_video_view ? [{ label: 'Video View Rate', value: pb.avg_video_view }] : []),
                    ].map((m) => (
                      <div key={m.label} style={{ background: 'rgba(62,180,137,0.05)', border: '1px solid rgba(62,180,137,0.12)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>{m.label}</p>
                        <p className="font-bebas" style={{ fontSize: 22, color: '#3EB489', margin: 0, lineHeight: 1 }}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '12px 16px' }}>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{pb.what_it_means}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
