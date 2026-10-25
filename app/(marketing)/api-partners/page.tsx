import type { Metadata } from 'next';
import { Boxes, Database, ShieldCheck, Sparkles, Wrench, Zap } from 'lucide-react';
import Hero from '@/components/marketing/Hero';
import Reveal from '@/components/marketing/Reveal';
import CodeBlock from '@/components/marketing/CodeBlock';
import {
  Button,
  GlassCard,
  IconFeature,
  IconWell,
  SectionHeading,
} from '@/components/marketing/primitives';

export const metadata: Metadata = { title: 'API & Partners' };

const CODE = `POST /v1/analyses
{ "brief": "...", "assets": [ ... ], "client_id": "acme" }
→ { "concave_score": 71, "drivers": { "attention": 64, ... }, "verdicts": [ ... ] }`;

export default function ApiPartnersPage() {
  return (
    <>
      {/* S1: Hero */}
      <Hero
        eyebrow="API & partners"
        title="Put Concave's critique inside your product."
        highlight="inside your product."
        sub="Score creative wherever it's made — your DAM, your ad builder, your workflow tool — via a straightforward REST API."
        align="left"
        primaryCta={{ label: 'Request API access', href: '#' }}
        visual={
          <div className="w-full">
            <CodeBlock code={CODE} lang="REST" />
          </div>
        }
      />

      {/* S2: Lifecycle */}
      <section className="mk-section">
        <div className="mk-container">
          <SectionHeading title="Across the creative lifecycle" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: 'Create',
                body: 'Score at the moment of creation — inline feedback in your tool.',
              },
              {
                icon: ShieldCheck,
                title: 'Govern',
                body: 'Enforce thresholds as automated gates in approval flows.',
              },
              {
                icon: Zap,
                title: 'Activate',
                body: 'Attach scores and evidence to assets as they ship to channels.',
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <GlassCard hoverable className="p-8">
                  <IconWell icon={c.icon} />
                  <h3 className="mk-h4 mt-4">{c.title}</h3>
                  <p className="mt-2 text-[16px] text-[var(--text-secondary)]">{c.body}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S3: Use cases */}
      <section className="mk-section mk-band-raised">
        <div className="mk-container">
          <SectionHeading title="Who builds on Concave" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Boxes,
                title: 'Creative-automation platforms',
                body: 'Give every generated variant a score and a reason before it reaches a human queue.',
              },
              {
                icon: Database,
                title: 'DAM / asset-management vendors',
                body: 'Attach effectiveness scores and evidence to assets where they already live.',
              },
              {
                icon: Wrench,
                title: 'In-house agency tooling',
                body: 'Wire Concave into internal review flows and custom dashboards.',
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <IconFeature {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* S4: Code block + note */}
      <section className="mk-section">
        <div className="mx-auto w-full max-w-3xl px-6">
          <SectionHeading title="One endpoint to a full verdict" />
          <Reveal>
            <CodeBlock code={CODE} lang="REST" />
            <p className="mt-6 text-center text-[14px] text-[var(--text-tertiary)]">
              White-label and co-branded embeds available.
            </p>
            <div className="mt-6 flex justify-center">
              <Button href="#">Request API access</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
