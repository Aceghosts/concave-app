import Link from 'next/link';
import { Globe, AtSign, Mail } from 'lucide-react';
import { FOOTER_COLUMNS } from './data';
import { CtaBand } from './primitives';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--glass-border)]">
      {/* Ambient glow behind the footer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 110%, rgba(61,220,200,0.07) 0%, transparent 70%), radial-gradient(50% 45% at 85% 100%, rgba(124,140,255,0.07) 0%, transparent 70%), var(--bg-raised)',
        }}
      />
      <div className="relative">
        {/* Zone 1: CTA band */}
        <CtaBand />

        {/* Zone 2: brand + link columns */}
        <div className="mk-container grid gap-x-10 gap-y-12 border-t border-[var(--glass-border)] py-16 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[20px] font-semibold tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-grotesk), sans-serif' }}
            >
              <span
                className="inline-block h-7 w-7 rounded-[8px] shadow-[0_0_16px_rgba(61,220,200,0.35)]"
                style={{ background: 'var(--gradient-brand)' }}
                aria-hidden
              />
              Concave
            </Link>
            <p className="mt-4 max-w-[26ch] text-[14px] leading-relaxed text-[var(--text-tertiary)]">
              Expert AI critique for agencies.
            </p>
          </div>
          <div className="col-span-full grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-4 lg:col-span-4 lg:grid-cols-subgrid">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[14.5px] text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Zone 3: baseline */}
        <div className="mk-container flex flex-col items-center justify-between gap-5 border-t border-[var(--glass-border)] py-8 md:flex-row">
          <p className="text-[13px] text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} Concave &middot; Expert AI critique for agencies.
          </p>
          <div className="flex gap-3">
            {[
              { icon: Globe, label: 'Website' },
              { icon: AtSign, label: 'Social' },
              { icon: Mail, label: 'Email' },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] bg-white/[0.04] text-[var(--text-tertiary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Icon size={16} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
