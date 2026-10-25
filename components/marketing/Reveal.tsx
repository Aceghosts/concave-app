'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * Scroll-reveal wrapper: fade-up 16px, 400ms, once (spec §1.7).
 *
 * Hydration-safe: the server (and first client render) emit the fully
 * visible state with identical props — no animation-dependent inline
 * styles are SSR'd. The fade-up is applied as progressive enhancement
 * after mount; with prefers-reduced-motion the element simply stays
 * visible and never animates.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only ever hidden after mount, on clients that animate, while out of view.
  const hidden = mounted && !reduce && !inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={hidden ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
      transition={hidden ? { duration: 0 } : { duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
