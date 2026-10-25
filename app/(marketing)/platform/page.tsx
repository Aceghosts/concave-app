import type { Metadata } from 'next';
import { Check, ClipboardCheck, FileSearch, Scale, Hammer, Send } from 'lucide-react';
import Hero from '@/components/marketing/Hero';
import Reveal from '@/components/marketing/Reveal';
import Accordion from '@/components/marketing/Accordion';
import Tabs from '@/components/marketing/Tabs';
import {
  Button,
  FaqJsonLd,
  GlassCard,
  IconFeature,
  IconWell,
  SectionHeading,
} from '@/components/marketing/primitives';
import {
  AbCompareMock,
  FlowDiagramMock,
  KpiDetailMock,
  PptxMock,
  ReportMock,
  ScreenshotFrame,
  TimelineMock,
} from '@/components/marketing/mocks';
import { DRIVERS } from '@/components/marketing/data';

export const metadata: Metadata = { title: 'Platform' };

const FAQ = [
  {
    q: 'How do you keep scores consistent?',
    a: 'Rubric-anchored prompting: every KPI has a written 0–100 rubric with worked examples. Same asset in, same score out.',
  },
  {
    q: 'What file types work?',
    a: 'PDF and PPTX decks, PNG/JPG, plain copy, and video (MP4). Decks are rendered as slides so design — not just words — gets judged.',
  },
  {
    q: 'Can we customize the framework?',
    a: 'Driver weightings and thresholds are configurable per client; custom KPIs are on the roadmap.',
  },
  {
    q: 'Where does our data live?',
    a: 'In your own workspace on managed Postgres with private storage. Never in training data. Export or delete anytime.',
  },
];

function TabPanel({ bullets, visual }: { bullets: string[]; visual: React.ReactNode }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <ul className="space-y-4">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[16px] text-[var(--text-secondary)]">
            <Check size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden />
            {b}
          </li>
        ))}
      </ul>
      {visual}
    </div>
  );
}

export default function PlatformPage() {
  return (
    <>
      <FaqJsonLd items={FAQ} />

      {/* S1: Hero */}
      <Hero
        eyebrow="The platform"
        title="One scoring engine behind every analysis."
        highlight="every analysis."
        sub="Six effectiveness drivers, rubric-anchored scoring, evidence for every verdict — the same engine whether you're testing one hook or a full campaign."
        align="left"
        primaryCta={{ label: 'Start analyzing', href: '/login' }}
        secondaryCta={{ label: 'Read the methodology', href: '#methodology' }}
        visual={
          <ScreenshotFrame>
            <ReportMock />
          </ScreenshotFrame>
        }
      />

      {/* S2: Engine explainer */}
      <section className="mk-section">
        <div className="mk-container">
          <SectionHeading title="How Concave scores." />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Scale,
                title: 'Rubric-anchored',
                body: 'Every KPI is scored 0–100 against a fixed written rubric, so the same asset gets the same score tomorrow.',
              },
              {
                icon: FileSearch,
                title: 'Evidence-first',
                body: 'No naked numbers. Each verdict cites what in the asset earned it — a frame, a line, a layout choice.',
              },
              {
                icon: ClipboardCheck,
                title: 'Context-aware',
                body: 'Assets are judged inside their context: the feed, the format, and above all the brief.',
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <IconFeature {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S3: Feature tour */}
      <section className="mk-section mk-band-raised">
        <div className="mk-container">
          <SectionHeading title="Everything between upload and client deck." />
          <Reveal>
            <Tabs
              tabs={[
                {
                  label: 'Upload & intake',
                  content: (
                    <TabPanel
                      bullets={[
                        'Drop in decks, images, video or a brief',
                        'Auto-extraction prefills the campaign form — you confirm, not retype',
                        'Analysis is blocked until files are fully read, so scores are never generic.',
                      ]}
                      visual={<FlowDiagramMock />}
                    />
                  ),
                },
                {
                  label: 'Scoring',
                  content: (
                    <TabPanel
                      bullets={[
                        'Concave Score + 6 drivers + sub-KPIs with red/amber/green',
                        'Plain-English verdict per KPI',
                        'Percentile context from your own calibration set.',
                      ]}
                      visual={<KpiDetailMock />}
                    />
                  ),
                },
                {
                  label: 'A/B comparison',
                  content: (
                    <TabPanel
                      bullets={[
                        'Variants side-by-side with per-KPI deltas',
                        'Spot exactly which change moved which driver',
                        'Keep the winning rationale for the client.',
                      ]}
                      visual={<AbCompareMock />}
                    />
                  ),
                },
                {
                  label: 'History & workspaces',
                  content: (
                    <TabPanel
                      bullets={[
                        'Every analysis saved with stable identity',
                        'Per-client workspaces keep accounts clean',
                        'Search past work by brand, channel or score.',
                      ]}
                      visual={<TimelineMock />}
                    />
                  ),
                },
                {
                  label: 'PPTX export',
                  content: (
                    <TabPanel
                      bullets={[
                        'One click to a structured deck',
                        'Scores, evidence and recommendations pre-laid-out',
                        'White-label ready — your agency on the cover.',
                      ]}
                      visual={<PptxMock />}
                    />
                  ),
                },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* S4: Workflow stage-gate */}
      <section className="mk-section mk-band-glow">
        <div className="mk-container">
          <SectionHeading
            title="Make effectiveness a gate, not an afterthought."
            sub="Set a threshold. Nothing ships below it. Concave slots in at briefing (score the strategy), development (score the work-in-progress), and release (final pre-flight) — so the standard is enforced, not aspirational."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FileSearch,
                stage: 'Briefing',
                line: 'Score the brief itself for clarity and single-mindedness',
              },
              { icon: Hammer, stage: 'Development', line: 'Critique WIP against the locked brief' },
              { icon: Send, stage: 'Release', line: 'Final check before money moves' },
            ].map((s, i) => (
              <Reveal key={s.stage} delay={i * 0.08}>
                <GlassCard hoverable className="p-8">
                  <IconWell icon={s.icon} />
                  <h3 className="mk-h5 mt-4">{s.stage}</h3>
                  <p className="mt-2 text-[16px] text-[var(--text-secondary)]">{s.line}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S5: Honest validation */}
      <section className="mk-section scroll-mt-20 mk-band-raised" id="methodology">
        <div className="mk-container grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="mk-eyebrow mb-3">No fake science</span>
            <h2 className="mk-h2">What we claim — and what we don&rsquo;t.</h2>
            <p className="mt-5 text-[17px] text-[var(--text-secondary)]">
              Concave is expert AI critique: a large language model applying a structured
              effectiveness framework, calibrated against your campaign history. We validate it the
              honest way — by measuring agreement with senior strategists and against your real
              past results, and publishing how we score. We do not claim to simulate brains, and we
              won&rsquo;t sell you a CTR prediction.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <GlassCard className="p-8">
              <h3 className="mk-h5">The six drivers</h3>
              <ul className="mt-5 space-y-4">
                {DRIVERS.map((d) => (
                  <li key={d.name} className="flex items-start gap-3">
                    <IconWell icon={d.icon} className="!h-8 !w-8" />
                    <div>
                      <span className="block text-[14px] font-semibold text-[var(--text-primary)]">
                        {d.name}
                      </span>
                      <span className="text-[13px] text-[var(--text-secondary)]">{d.definition}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      {/* S6: Integrations/API teaser */}
      <section className="py-16">
        <div className="mk-container">
          <Reveal>
            <div className="mk-glass flex flex-col items-start justify-between gap-5 p-8 md:flex-row md:items-center">
              <div>
                <h2 className="mk-h3">Plays well with your stack.</h2>
                <p className="mt-2 text-[16px] text-[var(--text-secondary)]">
                  Supabase-backed workspaces, CSV import of past results today; API access for
                  partners.
                </p>
              </div>
              <Button href="/api-partners" variant="ghost">
                Explore the API
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* S7: FAQ */}
      <section className="mk-section">
        <div className="mx-auto w-full max-w-3xl px-6">
          <SectionHeading title="Frequently asked" />
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}
