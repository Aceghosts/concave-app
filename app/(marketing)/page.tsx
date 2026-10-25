import type { Metadata } from 'next';
import {
  Briefcase,
  Building2,
  Compass,
  FileText,
  Film,
  History,
  Layers,
  MonitorSmartphone,
  PenTool,
  Presentation,
  Rocket,
  Share2,
  Target,
  Users,
} from 'lucide-react';
import Hero from '@/components/marketing/Hero';
import Reveal from '@/components/marketing/Reveal';
import Accordion from '@/components/marketing/Accordion';
import Carousel from '@/components/marketing/Carousel';
import {
  AppTile,
  FaqJsonLd,
  HonestyBar,
  IconWell,
  PersonaCard,
  SectionHeading,
  StepCard,
} from '@/components/marketing/primitives';
import {
  FlowDiagramMock,
  KpiDetailMock,
  PptxMock,
  ReportMock,
  ScreenshotFrame,
  TimelineMock,
} from '@/components/marketing/mocks';

export const metadata: Metadata = {
  title: 'Concave — Know if the campaign works, before the client does',
};

const FAQ = [
  {
    q: 'Can Concave predict CTR or ROAS?',
    a: "No — and be suspicious of tools that claim to. Concave delivers expert-level craft and strategy critique: what's weak, why, and how to fix it. Paired with your own past results, that's what actually moves performance.",
  },
  {
    q: 'How is this different from attention-prediction tools?',
    a: 'Attention tools tell you where eyes go on one asset. Concave judges whether the whole campaign delivers the brief — strategy fit, message, emotional pull, persuasion — across every asset together.',
  },
  {
    q: 'What do I need to run an analysis?',
    a: 'The brief (or a few answers to our intake questions) and your assets — images, decks, copy, or video. Scores and a full report arrive in minutes.',
  },
  {
    q: 'Is our client work safe?',
    a: 'Your uploads stay in your workspace, are never used to train models, and can be deleted at any time. Per-client separation is built in.',
  },
  {
    q: 'Can I put the report in front of a client?',
    a: "That's the point. Export a structured PPTX — scores, evidence, recommendations — and present it as your own analysis.",
  },
];

export default function HomePage() {
  return (
    <>
      <FaqJsonLd items={FAQ} />

      {/* S1: Hero */}
      <Hero
        hero
        eyebrow="AI campaign analysis for agencies"
        title="Know if the campaign works — before the client does."
        highlight="before the client does."
        sub="Concave reads your brief, scores every asset on six effectiveness drivers, and hands you a client-ready report in minutes. Expert AI critique, calibrated to your own campaign history — not generic category norms."
        primaryCta={{ label: 'Start analyzing', href: '/login' }}
        secondaryCta={{ label: 'See a sample report', href: '#sample-report' }}
        visual={
          <ScreenshotFrame chips={['Brief-aware', 'PPTX in one click', 'A/B side-by-side']}>
            <ReportMock />
          </ScreenshotFrame>
        }
      />

      {/* S2: Honesty bar */}
      <section className="mk-container -mt-2 py-10">
        <Reveal>
          <HonestyBar
            items={[
              { icon: Building2, label: 'Built for agencies' },
              { icon: Layers, label: 'Scores campaigns, not just assets' },
              { icon: History, label: 'Calibrated to your past results' },
              { icon: Presentation, label: 'Client-ready decks in one click' },
            ]}
          />
        </Reveal>
      </section>

      {/* S3: Problem framing */}
      <section className="mk-section">
        <div className="mk-container grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="mk-eyebrow mb-3">The gap</span>
            <h2 className="mk-h2">Asset scores don&rsquo;t answer the client&rsquo;s question.</h2>
            <p className="mt-5 text-[17px] text-[var(--text-secondary)]">
              Pre-test tools grade one banner against a category average. Your client asks something
              harder: does this <em>campaign</em> deliver the <em>brief</em>? Concave judges every
              asset in the context of the strategy it&rsquo;s supposed to serve — and tells you
              where it drifts.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                { icon: Layers, text: 'Whole-campaign view — assets scored together, not in isolation' },
                { icon: FileText, text: 'Brief-aware — strategic fit measured against the actual brief, not a guess' },
                { icon: Users, text: 'Audience-specific — relevance judged for the audience you’re targeting' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-4">
                  <IconWell icon={icon} />
                  <span className="text-[16px] text-[var(--text-secondary)]">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <FlowDiagramMock />
          </Reveal>
        </div>
      </section>

      {/* S4: Product tiles */}
      <section className="mk-section mk-band-raised">
        <div className="mk-container">
          <SectionHeading
            eyebrow="What Concave scores"
            title="One engine. Every channel your campaign touches."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Target,
                title: 'Campaign & Brief',
                oneLiner: "Score the whole campaign against the client's strategy brief.",
                href: '/campaign-analysis',
                badge: 'Flagship',
              },
              {
                icon: Share2,
                title: 'Social',
                oneLiner: 'Hooks, pacing, platform fit — before you spend a cent of media.',
                href: '/social',
              },
              {
                icon: MonitorSmartphone,
                title: 'Digital',
                oneLiner: 'Banners and display sets critiqued for clarity, CTA and brand.',
                href: '/digital',
              },
              {
                icon: Film,
                title: 'Video',
                oneLiner: 'Scene-level critique for TVCs, cutdowns and online video.',
                href: '/video',
              },
            ].map((tile, i) => (
              <Reveal key={tile.title} delay={i * 0.08} className="h-full [&>div]:h-full">
                <AppTile {...tile} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S5: How it works */}
      <section className="mk-section mk-band-glow">
        <div className="mk-container">
          <SectionHeading title="Predict. Optimize. Prove." />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                number: '01',
                title: 'Predict',
                body: 'Upload the brief and the assets. Concave scores everything on six drivers with evidence-backed verdicts, in minutes.',
              },
              {
                number: '02',
                title: 'Optimize',
                body: 'Every red or amber KPI comes with a specific, actionable fix. Re-run variants side-by-side until the campaign clears your bar.',
              },
              {
                number: '03',
                title: 'Prove',
                body: 'Export a client-ready PPTX that shows the before/after and the reasoning. Walk into the room with the argument already built.',
              },
            ].map((step, i) => (
              <Reveal key={step.number} delay={i * 0.08}>
                <StepCard {...step} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S6: Calibration moat */}
      <section className="mk-section mk-band-raised">
        <div className="mk-container">
          <Reveal>
            <div className="mk-glass grid items-center gap-10 !rounded-[24px] p-8 md:p-12 lg:grid-cols-2">
              <div>
                <span className="mk-eyebrow mb-3">Your data is the benchmark</span>
                <h2 className="mk-h2">
                  Generic norms tell you about the category. Your history tells you what wins.
                </h2>
                <p className="mt-5 text-[17px] text-[var(--text-secondary)]">
                  Feed Concave your past campaigns and their real results. Every new analysis is
                  then compared against <em>your</em> winners and <em>your</em> flops —
                  &lsquo;this hook resembles your strongest Q3 work&rsquo; beats &lsquo;above
                  category average&rsquo; every time.
                </p>
              </div>
              <TimelineMock />
            </div>
          </Reveal>
        </div>
      </section>

      {/* S7: Report showcase */}
      <section className="mk-section scroll-mt-20" id="sample-report">
        <div className="mk-container">
          <SectionHeading title="The report is the product." />
          <Reveal>
            <Carousel
              labels={['Concave Score and driver dashboard', 'Sub-KPI detail with evidence', 'Exported PPTX title slide']}
              slides={[<ReportMock key="1" />, <KpiDetailMock key="2" />, <PptxMock key="3" />]}
            />
            <p className="mt-6 text-center text-[15px] text-[var(--text-tertiary)]">
              One number for the room. Six drivers for the debate. Evidence for every verdict.
            </p>
          </Reveal>
        </div>
      </section>

      {/* S8: For agencies */}
      <section className="mk-section mk-band-raised">
        <div className="mk-container">
          <SectionHeading title="Built for how agencies actually work." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Compass, role: 'Strategy', body: 'Check the work against the brief before creative review.' },
              { icon: PenTool, role: 'Creative', body: 'Specific critique, not a black-box number — argue with the evidence.' },
              { icon: Briefcase, role: 'Account', body: 'Walk clients through a defensible, structured verdict.' },
              { icon: Rocket, role: 'New business', body: 'Pressure-test pitch work overnight, not over a focus group.' },
            ].map((p, i) => (
              <Reveal key={p.role} delay={i * 0.08}>
                <PersonaCard {...p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S9: FAQ */}
      <section className="mk-section">
        <div className="mx-auto w-full max-w-3xl px-6">
          <SectionHeading title="Frequently asked" />
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}
