'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { DRIVER_KEYS, DRIVER_LABELS, band, BAND_COLOR, to100, type Driver } from './types';

/** Six horizontal driver bars 0–100, colored by RAG band; click scrolls to the driver section. */
export default function DriverBars({ drivers, onSelect }: { drivers: Record<string, Driver>; onSelect?: (key: string) => void }) {
  const reduced = useReducedMotion();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
      {DRIVER_KEYS.map((key, i) => {
        const d = drivers[key];
        if (!d) return null;
        const s = to100(d.score);
        const color = BAND_COLOR[band(s)];
        return (
          <button
            key={key}
            onClick={() => onSelect?.(key)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: onSelect ? 'pointer' : 'default', textAlign: 'left' }}
            aria-label={`${DRIVER_LABELS[key]}: ${s} out of 100`}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {DRIVER_LABELS[key]}
              </span>
              <span className="font-bebas" style={{ fontSize: 20, color, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{s}</span>
            </div>
            <div style={{ height: 5, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: reduced ? `${s}%` : 0 }}
                animate={{ width: `${s}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 18, delay: i * 0.08 }}
                style={{ height: '100%', borderRadius: 99, background: color, boxShadow: `0 0 8px ${color}60` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
