import clsx from 'clsx';
import { Button } from './primitives';
import Reveal from './Reveal';

function renderTitle(title: string, highlight?: string) {
  if (!highlight || !title.includes(highlight)) return title;
  const i = title.indexOf(highlight);
  return (
    <>
      {title.slice(0, i)}
      <span className="mk-gradient-text">{highlight}</span>
      {title.slice(i + highlight.length)}
    </>
  );
}

export default function Hero({
  eyebrow,
  title,
  highlight,
  sub,
  primaryCta,
  secondaryCta,
  visual,
  align = 'center',
  hero = false,
}: {
  eyebrow: string;
  title: string;
  /** Phrase of the title rendered with the brand gradient. */
  highlight?: string;
  sub: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  visual?: React.ReactNode;
  align?: 'center' | 'left';
  /** Home hero: bigger type + glow CTA */
  hero?: boolean;
}) {
  const centered = align === 'center';
  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--bg-gradient-hero)' }}>
      {/* Layered color glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full opacity-70"
        style={{
          background: 'radial-gradient(closest-side, rgba(61,220,200,0.16), transparent 70%)',
          filter: 'blur(48px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-20 h-[520px] w-[720px] rounded-full opacity-70"
        style={{
          background: 'radial-gradient(closest-side, rgba(124,140,255,0.15), transparent 70%)',
          filter: 'blur(56px)',
        }}
      />
      <div aria-hidden className="mk-texture pointer-events-none absolute inset-0 opacity-70" />

      <div
        className={clsx(
          'mk-container relative flex gap-14 pb-24 pt-20 md:pt-28',
          centered
            ? 'flex-col items-center text-center'
            : 'flex-col items-start lg:flex-row lg:items-center',
        )}
      >
        <Reveal className={clsx(centered ? 'flex flex-col items-center' : 'flex-1')}>
          <span className="mk-eyebrow mb-5">{eyebrow}</span>
          <h1 className={clsx(hero ? 'mk-hero-h1' : 'mk-h1', 'max-w-[20ch]', centered && 'mx-auto')}>
            {renderTitle(title, highlight)}
          </h1>
          <p
            className={clsx(
              'mt-7 max-w-[56ch] text-[17px] text-[var(--text-secondary)] md:text-[19px]',
              centered && 'mx-auto',
            )}
          >
            {sub}
          </p>
          <div className={clsx('mt-10 flex flex-wrap gap-4', centered && 'justify-center')}>
            <Button href={primaryCta.href} size={hero ? 'lg' : 'md'} glow={hero}>
              {primaryCta.label}
            </Button>
            {secondaryCta && (
              <Button href={secondaryCta.href} variant="secondary" size={hero ? 'lg' : 'md'}>
                {secondaryCta.label}
              </Button>
            )}
          </div>
        </Reveal>
        {visual && (
          <Reveal
            delay={0.15}
            className={clsx('w-full', centered ? 'mt-12 max-w-3xl' : 'flex-1 lg:max-w-xl')}
          >
            {visual}
          </Reveal>
        )}
      </div>
    </section>
  );
}
