'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { PRODUCT_NAV } from './data';

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-[20px] font-semibold tracking-tight text-[var(--text-primary)]"
      style={{ fontFamily: 'var(--font-grotesk), sans-serif' }}
    >
      <span
        className="inline-block h-7 w-7 rounded-[8px] shadow-[0_0_14px_rgba(61,220,200,0.35)]"
        style={{ background: 'var(--gradient-brand)' }}
        aria-hidden
      />
      Concave
    </Link>
  );
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--glass-border)]"
      style={{
        background: 'rgba(7,10,20,0.75)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
      }}
    >
      <nav className="mk-container flex h-[72px] items-center justify-between" aria-label="Main">
        <Logo />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          <div className="group relative">
            <button
              className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[15px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              aria-haspopup="true"
              aria-expanded={undefined}
            >
              Product
              <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="mk-glass w-72 !bg-[#0C1020]/95 p-2">
                {PRODUCT_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-[10px] px-4 py-3 text-[15px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="rounded-full bg-[var(--accent-tint)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link
            href="/api-partners"
            className="rounded-[10px] px-4 py-2 text-[15px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            API
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="px-3 py-2 text-[15px] font-medium text-[var(--accent)] hover:underline"
          >
            Log in
          </Link>
          <Link href="/login" className="mk-btn mk-btn-primary mk-btn-sm">
            Start analyzing
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center text-[var(--text-primary)] md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </nav>

      {/* Mobile full-screen glass sheet */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto md:hidden"
          style={{
            background: 'rgba(7,10,20,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="mk-container flex h-16 items-center justify-between">
            <Logo />
            <button
              className="flex h-10 w-10 items-center justify-center text-[var(--text-primary)]"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          <div className="mk-container flex flex-1 flex-col gap-1 py-6">
            <button
              className="flex items-center justify-between py-4 text-left text-[18px] font-medium text-[var(--text-primary)]"
              onClick={() => setProductOpen((o) => !o)}
              aria-expanded={productOpen}
            >
              Product
              <ChevronDown
                size={20}
                strokeWidth={1.5}
                aria-hidden
                className={clsx('transition-transform', productOpen && 'rotate-180')}
              />
            </button>
            {productOpen && (
              <div className="flex flex-col border-l border-[var(--glass-border)] pl-4">
                {PRODUCT_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-3 text-[17px] text-[var(--text-secondary)]"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="rounded-full bg-[var(--accent-tint)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/api-partners"
              onClick={() => setMobileOpen(false)}
              className="py-4 text-[18px] font-medium text-[var(--text-primary)]"
            >
              API
            </Link>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Link href="/login" className="mk-btn mk-btn-primary w-full">
                Start analyzing
              </Link>
              <Link href="/login" className="mk-btn mk-btn-secondary w-full">
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
