'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

/** Scroll-snap carousel: dots + arrows + native swipe. */
export default function Carousel({
  slides,
  labels,
}: {
  slides: React.ReactNode[];
  labels?: string[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="relative" role="group" aria-roledescription="carousel">
      {/* Framed stage with a glow seat */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-12 -bottom-8 top-1/3"
        style={{
          background:
            'radial-gradient(55% 70% at 50% 100%, rgba(61,220,200,0.14) 0%, rgba(124,140,255,0.08) 50%, transparent 80%)',
          filter: 'blur(32px)',
        }}
      />
      <div className="mk-glass relative !rounded-[24px] p-3 md:p-5">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-[16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s, i) => (
            <div
              key={i}
              className="w-full shrink-0 snap-center px-1"
              aria-label={labels?.[i] ?? `Slide ${i + 1} of ${slides.length}`}
              aria-roledescription="slide"
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-7 flex items-center justify-center gap-6">
        <button
          onClick={() => goTo(index - 1)}
          aria-label="Previous slide"
          disabled={index === 0}
          className="mk-glass mk-glass-hover flex h-10 w-10 items-center justify-center !rounded-full text-[var(--text-secondary)] disabled:opacity-40"
        >
          <ChevronLeft size={18} strokeWidth={1.5} aria-hidden />
        </button>
        <div className="mk-glass flex gap-3 !rounded-full px-5 py-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={clsx(
                'h-2.5 rounded-full transition-all duration-200',
                i === index
                  ? 'w-7 bg-[var(--accent)] shadow-[0_0_10px_rgba(61,220,200,0.5)]'
                  : 'w-2.5 bg-[var(--grey-700)] hover:bg-[var(--grey-500)]',
              )}
            />
          ))}
        </div>
        <button
          onClick={() => goTo(index + 1)}
          aria-label="Next slide"
          disabled={index === slides.length - 1}
          className="mk-glass mk-glass-hover flex h-10 w-10 items-center justify-center !rounded-full text-[var(--text-secondary)] disabled:opacity-40"
        >
          <ChevronRight size={18} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
    </div>
  );
}
