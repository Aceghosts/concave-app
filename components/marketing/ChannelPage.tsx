import type { LucideIcon } from 'lucide-react';
import Hero from './Hero';
import Reveal from './Reveal';
import Accordion from './Accordion';
import {
  ChallengeSolution,
  DriverChip,
  FaqJsonLd,
  PersonaCard,
  SectionHeading,
} from './primitives';
import { AbCompareMock } from './mocks';
import { DRIVERS } from './data';

export interface ChannelPageProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  sub: string;
  primaryCta: { label: string; href: string };
  heroVisual?: React.ReactNode;
  pairs: { challenge: string; solution: string }[];
  emphasizedDrivers: string[];
  spotlight: { title: string; note: string };
  abLoop?: { title: string; body: string };
  personas?: { icon: LucideIcon; role: string; body: string }[];
  faq: { q: string; a: string }[];
}

/** Shared skeleton for /social, /digital, /video (spec §3.4–3.6). */
export default function ChannelPage({
  eyebrow,
  title,
  highlight,
  sub,
  primaryCta,
  heroVisual,
  pairs,
  emphasizedDrivers,
  spotlight,
  abLoop,
  personas,
  faq,
}: ChannelPageProps) {
  return (
    <>
      <FaqJsonLd items={faq} />
      <Hero
        eyebrow={eyebrow}
        title={title}
        highlight={highlight}
        sub={sub}
        align="left"
        primaryCta={primaryCta}
        secondaryCta={{ label: 'See a sample report', href: '/#sample-report' }}
        visual={heroVisual}
      />

      {/* Challenge → Solution */}
      <section className="mk-section">
        <div className="mk-container">
          <div className="grid gap-6 md:grid-cols-2">
            {pairs.map((pair, i) => (
              <Reveal key={pair.challenge} delay={i * 0.08}>
                <ChallengeSolution {...pair} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Driver spotlight */}
      <section className="mk-section mk-band-raised">
        <div className="mk-container text-center">
          <SectionHeading title={spotlight.title} sub={spotlight.note} />
          <Reveal>
            <div className="flex flex-wrap justify-center gap-3">
              {DRIVERS.map((d) => (
                <DriverChip
                  key={d.name}
                  driver={d.name}
                  icon={d.icon}
                  emphasized={emphasizedDrivers.includes(d.name)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* A/B loop */}
      {abLoop && (
        <section className="mk-section">
          <div className="mk-container grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <h2 className="mk-h2">{abLoop.title}</h2>
              <p className="mt-5 text-[17px] text-[var(--text-secondary)]">{abLoop.body}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <AbCompareMock />
            </Reveal>
          </div>
        </section>
      )}

      {/* Personas */}
      {personas && (
        <section className="mk-section mk-band-raised">
          <div className="mk-container">
            <div className="grid gap-6 md:grid-cols-3">
              {personas.map((p, i) => (
                <Reveal key={p.role} delay={i * 0.08}>
                  <PersonaCard {...p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mk-section">
        <div className="mx-auto w-full max-w-3xl px-6">
          <SectionHeading title="Frequently asked" />
          <Accordion items={faq} />
        </div>
      </section>
    </>
  );
}
