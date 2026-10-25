import Link from 'next/link';
import clsx from 'clsx';
import { ArrowRight, type LucideIcon } from 'lucide-react';

/* ── Button ───────────────────────────────────────────────── */
export function Button({
  href,
  variant = 'primary',
  size = 'md',
  glow = false,
  className,
  children,
}: {
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'mk-btn',
        variant === 'primary' && 'mk-btn-primary',
        variant === 'secondary' && 'mk-btn-secondary',
        variant === 'ghost' && 'mk-btn-ghost',
        size === 'sm' && 'mk-btn-sm',
        size === 'lg' && 'mk-btn-lg',
        glow && 'mk-btn-glow',
        className,
      )}
    >
      {children}
      {variant === 'ghost' && <ArrowRight size={16} aria-hidden />}
    </Link>
  );
}

/* ── GlassCard ────────────────────────────────────────────── */
export function GlassCard({
  children,
  hoverable = false,
  className,
}: {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx('mk-glass', hoverable && 'mk-glass-hover', className ?? 'p-6')}>
      {children}
    </div>
  );
}

/* ── SectionHeading ───────────────────────────────────────── */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'mb-12 md:mb-16',
        align === 'center' && 'text-center [&_p]:mx-auto',
        className,
      )}
    >
      {eyebrow && <span className="mk-eyebrow mb-4">{eyebrow}</span>}
      <h2 className="mk-h2">{title}</h2>
      {sub && <p className="mt-5 max-w-[60ch] text-[17px] text-[var(--text-secondary)] md:text-[18px]">{sub}</p>}
    </div>
  );
}

/* ── IconWell (40px rounded square, accent tint) ──────────── */
export function IconWell({
  icon: Icon,
  small = false,
  className,
}: {
  icon: LucideIcon;
  small?: boolean;
  className?: string;
}) {
  return (
    <span className={clsx('mk-iconwell', small && 'mk-iconwell-sm', className)} aria-hidden>
      <Icon size={small ? 17 : 21} strokeWidth={1.5} />
    </span>
  );
}

/* ── IconFeature (3-col rows) ─────────────────────────────── */
export function IconFeature({
  icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <GlassCard hoverable className="p-6">
      <IconWell icon={icon} />
      <h3 className="mk-h5 mt-4">{title}</h3>
      <p className="mt-2 text-[16px] text-[var(--text-secondary)]">{body}</p>
    </GlassCard>
  );
}

/* ── PersonaCard ──────────────────────────────────────────── */
export function PersonaCard({
  icon,
  role,
  body,
}: {
  icon: LucideIcon;
  role: string;
  body: string;
}) {
  return (
    <GlassCard hoverable className="p-6">
      <IconWell icon={icon} />
      <h3 className="mk-h5 mt-4">{role}</h3>
      <p className="mt-2 text-[16px] text-[var(--text-secondary)]">{body}</p>
    </GlassCard>
  );
}

/* ── StepCard (numbered 01/02/03) ─────────────────────────── */
export function StepCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <GlassCard hoverable className="p-8">
      <span
        className="mk-tnum mk-gradient-text block text-[52px] font-semibold leading-none"
        style={{ fontFamily: 'var(--font-grotesk), sans-serif' }}
      >
        {number}
      </span>
      <h3 className="mk-h4 mt-5">{title}</h3>
      <p className="mt-3 text-[17px] text-[var(--text-secondary)]">{body}</p>
    </GlassCard>
  );
}

/* ── AppTile ──────────────────────────────────────────────── */
export function AppTile({
  icon,
  title,
  oneLiner,
  href,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  oneLiner: string;
  href: string;
  badge?: string;
}) {
  return (
    <GlassCard hoverable className="relative flex flex-col p-6">
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-[var(--accent-tint)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          {badge}
        </span>
      )}
      <IconWell icon={icon} />
      <h3 className="mk-h5 mt-4">{title}</h3>
      <p className="mt-2 flex-1 text-[16px] text-[var(--text-secondary)]">{oneLiner}</p>
      <div className="mt-4">
        <Button href={href} variant="ghost" size="sm" className="!px-0">
          Explore
        </Button>
      </div>
    </GlassCard>
  );
}

/* ── ChallengeSolution ────────────────────────────────────── */
export function ChallengeSolution({
  challenge,
  solution,
}: {
  challenge: string;
  solution: string;
}) {
  return (
    <GlassCard hoverable className="p-6">
      <div className="rounded-xl bg-[var(--status-red-tint)] p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--status-red)]">
          Challenge
        </span>
        <p className="mt-1 text-[15px] font-medium text-[var(--text-primary)]">
          &ldquo;{challenge}&rdquo;
        </p>
      </div>
      <div className="my-3 flex justify-center text-[var(--text-tertiary)]" aria-hidden>
        <ArrowRight size={18} className="rotate-90" strokeWidth={1.5} />
      </div>
      <div className="rounded-xl bg-[var(--status-green-tint)] p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--status-green)]">
          Solution
        </span>
        <p className="mt-1 text-[16px] text-[var(--text-secondary)]">{solution}</p>
      </div>
    </GlassCard>
  );
}

/* ── DriverChip ───────────────────────────────────────────── */
export function DriverChip({
  driver,
  icon: Icon,
  emphasized = false,
}: {
  driver: string;
  icon: LucideIcon;
  emphasized?: boolean;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-medium',
        emphasized
          ? 'border-[var(--accent)] bg-[var(--accent-tint)] text-[var(--accent)]'
          : 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)]',
      )}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden />
      {driver}
    </span>
  );
}

/* ── HonestyBar ───────────────────────────────────────────── */
export function HonestyBar({ items }: { items: { icon: LucideIcon; label: string }[] }) {
  return (
    <div className="mk-glass grid grid-cols-2 gap-x-6 gap-y-6 px-7 py-6 md:grid-cols-4 md:px-9 md:py-7">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3.5">
          <IconWell icon={Icon} small />
          <span className="text-[14px] font-medium leading-snug text-[var(--text-secondary)]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Stepper (vertical, connector line) ───────────────────── */
export function Stepper({
  steps,
}: {
  steps: { title: string; body?: string; visual?: React.ReactNode }[];
}) {
  return (
    <ol className="relative space-y-10">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-5">
          <div className="flex flex-col items-center">
            <span
              className="mk-tnum flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--accent-tint)] text-[15px] font-semibold text-[var(--accent)]"
              style={{ fontFamily: 'var(--font-grotesk), sans-serif' }}
            >
              {i + 1}
            </span>
            {i < steps.length - 1 && (
              <span className="mt-2 w-px flex-1 bg-[var(--glass-border)]" aria-hidden />
            )}
          </div>
          <div className="pb-2 pt-1.5">
            <h3 className="mk-h5">{step.title}</h3>
            {step.body && (
              <p className="mt-2 text-[16px] text-[var(--text-secondary)]">{step.body}</p>
            )}
            {step.visual && <div className="mt-4">{step.visual}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── CtaBand (contained glass panel with internal glows) ──── */
export function CtaBand() {
  return (
    <div className="mk-container py-16 md:py-20">
      <div className="mk-texture relative overflow-hidden rounded-[24px] border border-[var(--glass-border)] px-6 py-16 text-center md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 80% at 25% 0%, rgba(61,220,200,0.14), transparent 70%), radial-gradient(60% 80% at 80% 100%, rgba(124,140,255,0.12), transparent 70%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))',
          }}
        />
        <div className="relative">
          <h2 className="mk-h2 mx-auto max-w-2xl">
            Score your next campaign before the client sees it.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/login" variant="primary" size="lg">
              Start analyzing
            </Button>
            <Button href="/campaign-analysis" variant="ghost">
              Talk to us <ArrowRight className="ml-1 inline h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FaqJsonLd ────────────────────────────────────────────── */
export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
