'use client';

import { useId, useRef, useState } from 'react';

export default function Tabs({
  tabs,
}: {
  tabs: { label: string; content: React.ReactNode }[];
}) {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = active;
    if (e.key === 'ArrowRight') next = (active + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (active - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div>
      {/* Mobile: select dropdown */}
      <label className="sr-only" htmlFor={`${baseId}-select`}>
        Select a feature
      </label>
      <select
        id={`${baseId}-select`}
        value={active}
        onChange={(e) => setActive(Number(e.target.value))}
        className="mk-glass mb-6 w-full !rounded-[10px] px-4 py-3 text-[15px] text-[var(--text-primary)] md:hidden"
        style={{ background: 'var(--glass-bg)' }}
      >
        {tabs.map((t, i) => (
          <option key={t.label} value={i} className="bg-[#0C1020]">
            {t.label}
          </option>
        ))}
      </select>

      {/* Desktop: tablist */}
      <div
        role="tablist"
        aria-label="Features"
        onKeyDown={onKeyDown}
        className="mb-8 hidden flex-wrap gap-2 md:flex"
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${baseId}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${baseId}-tabpanel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={
              i === active
                ? 'rounded-full border border-[var(--accent)] bg-[var(--accent-tint)] px-5 py-2.5 text-[14px] font-medium text-[var(--accent)]'
                : 'rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 text-[14px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--glass-border-strong)] hover:text-[var(--text-primary)]'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t, i) => (
        <div
          key={t.label}
          role="tabpanel"
          id={`${baseId}-tabpanel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
