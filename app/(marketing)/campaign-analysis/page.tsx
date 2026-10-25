import type { Metadata } from 'next';
import { Award, FileCheck, Gauge, Handshake, ListOrdered, Presentation, Target } from 'lucide-react';
import Hero from '@/components/marketing/Hero';
import Reveal from '@/components/marketing/Reveal';
import Accordion from '@/components/marketing/Accordion';
import {
  ChallengeSolution,
  FaqJsonLd,
  IconFeature,
  PersonaCard,
  SectionHeading,
  Stepper,
} from '@/components/marketing/primitives';
import { FlowDiagramMock } from '@/components/marketing/mocks';

export const metadata: Metadata = { title: 'Campaign & Brief Analysis' };

const PAIRS = [
  {
    challenge: 'The brief says one thing, the work says another.',
    solution:
      'Strategic Fit is scored against the actual brief text — with the exact lines of divergence quoted back to you.',
  },
  {
    challenge: 'Every asset was approved, the campaign still feels off.',
    solution:
      'Cross-asset coherence check: message, tone and visual identity tracked across the set.',
  },
  {
    challenge: "We can't tell which asset is dragging the campaign down.",
    solution:
      'Per-asset contribution view: see which piece pulls the Concave Score up and which bleeds it.',
  },
  {
    challenge: 'Client feedback is vibes; we need an argument.',
    solution:
      "Evidence-cited verdicts turn 'I don't love it' conversations into specific, fixable items.",
  },
  {
    challenge: 'No time for a focus group before the pitch.',
    solution: 'Full campaign analysis in minutes, any hour of the night before.',
  },
  {
    challenge: "Generic norms don't fit this client.",
    solution:
      "Calibration: scores contextualized against this client's own past campaigns and results.",
  },
];

const FAQ = [
  {
    q: "What counts as a 'campaign' here?",
    a: 'Any set of assets meant to work together — a launch set, a pitch deck plus key visuals, a month of social. Two assets or forty.',
  },
  {
    q: "What if there's no written brief?",
    a: 'Concave asks you a short series of intake questions — objective, audience, single-minded proposition, mandatories — and builds the scoring context from your answers.',
  },
  {
    q: 'Does it judge each asset too?',
    a: 'Yes. You get per-asset scores plus the campaign-level view; both appear in the export.',
  },
  {
    q: 'How does it handle mixed formats?',
    a: 'Decks are rendered slide-by-slide as images, video is watched scene-by-scene, copy is read in full — then everything is judged as one system.',
  },
];

export default function CampaignAnalysisPage() {
  return (
    <>
      <FaqJsonLd items={FAQ} />

      {/* S1: Hero */}
      <Hero
        eyebrow="Flagship · Campaign & Brief Analysis"
        title="Score the campaign against the brief."
        highlight="against the brief."
        sub="Single-asset tools can't see the strategy. Concave reads the client's brief, then judges the whole campaign — every asset, together — on whether it delivers. This is the analysis the room actually argues about."
        align="left"
        primaryCta={{ label: 'Analyze a campaign', href: '/login' }}
        secondaryCta={{ label: 'See a sample report', href: '/#sample-report' }}
        visual={<FlowDiagramMock highlightDriver="Strategic Fit" />}
      />

      {/* S2: Statement block */}
      <section className="mk-section">
        <div className="mx-auto w-full max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="mk-h2">A campaign can be six great assets and still miss.</h2>
            <p className="mx-auto mt-6 text-[17px] text-[var(--text-secondary)]">
              Each ad can score well alone while the set contradicts itself — three different value
              props, a hero film the social cutdowns abandon, a tagline the landing page never pays
              off. Campaign-level analysis catches drift that no per-asset score can see.
            </p>
          </Reveal>
        </div>
      </section>

      {/* S3: Challenge → Solution */}
      <section className="mk-section mk-band-raised">
        <div className="mk-container">
          <div className="grid gap-6 md:grid-cols-2">
            {PAIRS.map((pair, i) => (
              <Reveal key={pair.challenge} delay={i * 0.06}>
                <ChallengeSolution {...pair} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S4: What you get */}
      <section className="mk-section mk-band-glow">
        <div className="mk-container">
          <SectionHeading title="What you get" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Gauge,
                title: 'Campaign Concave Score',
                body: 'One number for the whole set, decomposed into the six drivers.',
              },
              {
                icon: FileCheck,
                title: 'Brief-fidelity report',
                body: 'Objective-by-objective: delivered, partially delivered, missed — with evidence.',
              },
              {
                icon: ListOrdered,
                title: 'Fix list, ranked',
                body: 'Recommendations ordered by expected impact on the weakest driver.',
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <IconFeature {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S5: Walkthrough */}
      <section className="mk-section mk-band-raised">
        <div className="mk-container grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading align="left" title="How a campaign run works" className="!mb-8" />
            <Stepper
              steps={[
                { title: 'Upload the brief — or answer four intake questions.' },
                { title: 'Add the campaign assets: decks, stills, copy, video.' },
                { title: 'Concave scores each asset and the campaign as a system.' },
                { title: 'Export the PPTX and take the argument to the client.' },
              ]}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <FlowDiagramMock />
          </Reveal>
        </div>
      </section>

      {/* S6: Personas */}
      <section className="mk-section">
        <div className="mk-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Target,
                role: 'Pitch teams',
                body: "Stress-test speculative work against the prospect's brief before the room does.",
              },
              {
                icon: Award,
                role: 'Strategy directors',
                body: 'Verify the work still serves the strategy after round five of amends.',
              },
              {
                icon: Presentation,
                role: 'Creative directors',
                body: 'An articulate second opinion that cites its reasons.',
              },
              {
                icon: Handshake,
                role: 'Account leads',
                body: 'A structured, neutral document to anchor difficult client conversations.',
              },
            ].map((p, i) => (
              <Reveal key={p.role} delay={i * 0.08}>
                <PersonaCard {...p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S7: FAQ */}
      <section className="mk-section mk-band-raised">
        <div className="mx-auto w-full max-w-3xl px-6">
          <SectionHeading title="Frequently asked" />
          <Accordion items={FAQ} />
        </div>
      </section>
    </>
  );
}
