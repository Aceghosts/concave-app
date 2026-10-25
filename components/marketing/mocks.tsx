import clsx from 'clsx';
import { FileText, Image as ImageIcon, Film, LayoutGrid, Type } from 'lucide-react';

/* Styled product-UI placeholders built from divs/SVG — no external images.
   Numbers shown are illustrative mock-UI values, not marketing claims. */

function bandColor(score: number) {
  return score >= 70 ? 'var(--status-green)' : score >= 40 ? 'var(--status-amber)' : 'var(--status-red)';
}

/* ── Score ring ───────────────────────────────────────────── */
export function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = bandColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--grey-800)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="mk-tnum font-semibold leading-none text-[var(--text-primary)]"
          style={{ fontSize: size * 0.26, fontFamily: 'var(--font-grotesk), sans-serif' }}
        >
          {score}
        </span>
        <span className="mt-1 text-[9px] uppercase tracking-wider text-[var(--text-tertiary)]">
          Concave Score
        </span>
      </div>
    </div>
  );
}

/* ── Driver bars ──────────────────────────────────────────── */
const MOCK_DRIVERS: [string, number][] = [
  ['Attention', 64],
  ['Branding', 78],
  ['Processing Ease', 82],
  ['Strategic Fit', 58],
  ['Emotional Engagement', 71],
  ['Persuasion', 66],
];

export function DriverBars({ compact = false }: { compact?: boolean }) {
  return (
    <div className={clsx('w-full', compact ? 'space-y-2' : 'space-y-3')}>
      {MOCK_DRIVERS.map(([name, score]) => (
        <div key={name}>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-secondary)]">{name}</span>
            <span className="mk-tnum text-[var(--text-tertiary)]">{score}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--grey-800)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${score}%`, background: bandColor(score) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Report dashboard mock (ring + bars) ──────────────────── */
export function ReportMock() {
  return (
    <div className="mk-glass p-6 md:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ScoreRing score={71} />
        <div className="w-full flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden />
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">
              Spring launch — campaign analysis
            </span>
          </div>
          <DriverBars />
        </div>
      </div>
    </div>
  );
}

/* ── Sub-KPI detail mock (RAG rows + evidence) ────────────── */
const MOCK_KPIS: { name: string; score: number; status: 'Strong' | 'Watch' | 'Fix'; evidence: string }[] = [
  { name: 'Hook strength', score: 74, status: 'Strong', evidence: 'Opening frame leads with the product in motion.' },
  { name: 'CTA strength', score: 52, status: 'Watch', evidence: 'The CTA gets a low share of visual attention.' },
  { name: 'Brief-objective match', score: 35, status: 'Fix', evidence: 'Asset 3 leads with price; the brief leads with craft.' },
];

const STATUS_STYLE = {
  Strong: { color: 'var(--status-green)', bg: 'var(--status-green-tint)' },
  Watch: { color: 'var(--status-amber)', bg: 'var(--status-amber-tint)' },
  Fix: { color: 'var(--status-red)', bg: 'var(--status-red-tint)' },
} as const;

export function KpiDetailMock() {
  return (
    <div className="mk-glass space-y-3 p-6 md:p-8">
      {MOCK_KPIS.map((kpi) => {
        const s = STATUS_STYLE[kpi.status];
        return (
          <div key={kpi.name} className="rounded-xl border border-[var(--glass-border)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden />
                <span className="text-[14px] font-medium text-[var(--text-primary)]">{kpi.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="mk-tnum text-[13px] text-[var(--text-tertiary)]">{kpi.score}/100</span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ color: s.color, background: s.bg }}
                >
                  {kpi.status}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[13px] text-[var(--text-secondary)]">{kpi.evidence}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Exported PPTX title slide mock ───────────────────────── */
export function PptxMock() {
  return (
    <div className="mk-glass p-6 md:p-8">
      <div
        className="mx-auto aspect-video w-full max-w-xl rounded-xl border border-[var(--glass-border)] p-8"
        style={{ background: 'var(--bg-gradient-hero)' }}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="h-6 w-28 rounded-md bg-[var(--glass-bg-hover)]" aria-hidden />
          <div>
            <div
              className="text-[22px] font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-grotesk), sans-serif' }}
            >
              Campaign Effectiveness Report
            </div>
            <div className="mt-1 text-[13px] text-[var(--text-tertiary)]">
              Scores &middot; Evidence &middot; Recommendations
            </div>
          </div>
          <div className="flex gap-2" aria-hidden>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span key={i} className="h-1.5 w-10 rounded-full bg-[var(--accent-tint)]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Flow diagram: brief + assets → one score ring ────────── */
const ASSET_ICONS = [
  { icon: ImageIcon, label: 'Key visual' },
  { icon: Film, label: 'Hero film' },
  { icon: LayoutGrid, label: 'Social set' },
  { icon: Type, label: 'Copy' },
];

export function FlowDiagramMock({ highlightDriver }: { highlightDriver?: string }) {
  return (
    <div className="mk-glass p-6 md:p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--accent)] bg-[var(--accent-tint)] px-5 py-3">
          <FileText size={20} strokeWidth={1.5} className="text-[var(--accent)]" aria-hidden />
          <span className="text-[14px] font-medium text-[var(--text-primary)]">Client brief</span>
        </div>
        <svg width="2" height="24" aria-hidden>
          <line x1="1" y1="0" x2="1" y2="24" stroke="var(--grey-700)" strokeDasharray="3 3" />
        </svg>
        <div className="grid w-full grid-cols-2 gap-3">
          {ASSET_ICONS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-[var(--glass-border)] bg-white/[0.045] px-4 py-3.5"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
            >
              <span className="mk-iconwell mk-iconwell-sm" aria-hidden>
                <Icon size={16} strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-[var(--text-primary)]">
                  {label}
                </span>
                <span className="mt-1.5 block h-1 w-14 rounded-full bg-white/10" aria-hidden />
              </span>
            </div>
          ))}
        </div>
        <svg width="2" height="24" aria-hidden>
          <line x1="1" y1="0" x2="1" y2="24" stroke="var(--grey-700)" strokeDasharray="3 3" />
        </svg>
        <ScoreRing score={71} size={104} />
        {highlightDriver && (
          <span className="rounded-full border border-[var(--accent)] bg-[var(--accent-tint)] px-4 py-1.5 text-[12px] font-medium text-[var(--accent)]">
            {highlightDriver}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Calibration timeline mock ────────────────────────────── */
export function TimelineMock() {
  const past: [string, number][] = [
    ['Q1 relaunch', 62],
    ['Summer social', 81],
    ['Q3 brand film', 74],
  ];
  return (
    <div className="mk-glass p-6 md:p-8">
      <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
        Past campaigns · real results
      </span>
      <div className="space-y-3">
        {past.map(([name, score]) => (
          <div
            key={name}
            className="flex items-center gap-4 rounded-xl border border-[var(--glass-border)] bg-white/[0.045] px-4 py-3.5"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
          >
            <span className="w-28 shrink-0 truncate text-[13px] font-medium text-[var(--text-primary)]">
              {name}
            </span>
            <span className="h-1.5 flex-1 rounded-full bg-[var(--grey-800)]">
              <span
                className="block h-full rounded-full"
                style={{ width: `${score}%`, background: bandColor(score) }}
              />
            </span>
            <span
              className="mk-tnum rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
              style={{
                color: bandColor(score),
                background:
                  score >= 70 ? 'var(--status-green-tint)' : 'var(--status-amber-tint)',
              }}
            >
              {score}
            </span>
          </div>
        ))}
      </div>
      <div className="my-4 flex justify-center" aria-hidden>
        <svg width="2" height="20">
          <line x1="1" y1="0" x2="1" y2="20" stroke="var(--grey-700)" strokeDasharray="3 3" />
        </svg>
      </div>
      <div
        className="rounded-xl border border-transparent p-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(61,220,200,0.12), rgba(124,140,255,0.07)) padding-box, var(--gradient-brand) border-box',
          boxShadow: '0 0 28px rgba(61,220,200,0.14)',
        }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          Calibration
        </span>
        <p className="mt-1.5 text-[14px] font-medium text-[var(--text-primary)]">
          This hook resembles your strongest Q3 work.
        </p>
      </div>
    </div>
  );
}

/* ── A/B side-by-side mock ────────────────────────────────── */
export function AbCompareMock() {
  return (
    <div className="mk-glass p-6 md:p-8">
      <div className="grid grid-cols-2 gap-4">
        {(['A', 'B'] as const).map((v) => (
          <div key={v} className="flex flex-col items-center gap-4 rounded-xl border border-[var(--glass-border)] p-4">
            <span className="text-[12px] font-semibold text-[var(--text-tertiary)]">Variant {v}</span>
            <ScoreRing score={v === 'A' ? 64 : 71} size={88} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="rounded-full bg-[var(--status-green-tint)] px-3 py-1 text-[12px] font-semibold text-[var(--status-green)]">
          B +7
        </span>
        <span className="text-[12px] text-[var(--text-tertiary)]">stronger first-second hook</span>
      </div>
    </div>
  );
}

/* ── ScreenshotFrame: product window frame on a reflective glow ── */
export function ScreenshotFrame({
  children,
  chips,
}: {
  children: React.ReactNode;
  /** kept for API compatibility; frames no longer tilt */
  tilt?: boolean;
  chips?: string[];
}) {
  return (
    <div className="relative">
      {/* Reflective glow the frame sits on */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -bottom-12 h-44"
        style={{
          background:
            'radial-gradient(55% 100% at 50% 0%, rgba(61,220,200,0.22) 0%, rgba(124,140,255,0.12) 45%, transparent 78%)',
          filter: 'blur(28px)',
        }}
      />
      <div className="mk-glass relative overflow-hidden !rounded-[20px]">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-[var(--glass-border)] bg-white/[0.03] px-4 py-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]/70" />
          </span>
          <span className="mx-auto hidden rounded-full border border-[var(--glass-border)] bg-black/20 px-4 py-1 text-[11px] text-[var(--text-tertiary)] sm:block">
            app.concave · campaign analysis
          </span>
        </div>
        <div className="p-2 md:p-3">{children}</div>
      </div>
      {/* Glass chips anchored to the frame corners */}
      {chips?.map((chip, i) => (
        <span
          key={chip}
          className="mk-chip absolute z-10 hidden md:inline-flex"
          style={
            [
              { top: '-16px', left: '28px' },
              { top: '34%', right: '-20px' },
              { bottom: '-14px', left: '14%' },
            ][i % 3]
          }
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
          {chip}
        </span>
      ))}
    </div>
  );
}
