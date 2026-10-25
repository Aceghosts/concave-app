'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

export default function Accordion({
  items,
  single = true,
}: {
  items: { q: string; a: string }[];
  single?: boolean;
}) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(single ? ([] as number[]) : prev);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="space-y-4">
      {items.map(({ q, a }, i) => {
        const isOpen = open.has(i);
        const panelId = `${baseId}-panel-${i}`;
        const btnId = `${baseId}-btn-${i}`;
        return (
          <div key={q} className={clsx('mk-glass overflow-hidden', isOpen && 'mk-glass-hover')}>
            <h3>
              <button
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left text-[16px] font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent)] md:px-8 md:py-6 md:text-[17px]"
              >
                {q}
                <span
                  className={clsx(
                    'mk-iconwell mk-iconwell-sm !h-8 !w-8 transition-transform duration-200',
                    isOpen && 'rotate-45',
                  )}
                  aria-hidden
                >
                  <Plus size={16} strokeWidth={2} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={clsx(
                'grid transition-[grid-template-rows] duration-200',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 pr-16 text-[15.5px] leading-relaxed text-[var(--text-secondary)] md:px-8 md:pb-7 md:text-[16px]">
                  {a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
