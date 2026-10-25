'use client';

import { motion, useReducedMotion } from 'framer-motion';
import CountUp from '@/components/CountUp';
import { band, BAND_COLOR } from './types';

/** Concave Score ring: one number 0–100, stroke colored by RAG band, animated sweep. */
export default function ScoreRing({ score100, size = 120, label = 'Concave Score' }: { score100: number; size?: number; label?: string }) {
  const reduced = useReducedMotion();
  const color = BAND_COLOR[band(score100)];
  const stroke = Math.max(6, Math.round(size / 15));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - Math.min(100, Math.max(0, score100)) / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-label={`${label}: ${score100} out of 100`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: reduced ? target : c }}
            animate={{ strokeDashoffset: target }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="font-bebas" style={{ fontSize: size * 0.34, color, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
            <CountUp target={score100} decimals={0} duration={0.8} />
          </span>
        </div>
      </div>
      {label && (
        <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {label}
        </span>
      )}
    </div>
  );
}
