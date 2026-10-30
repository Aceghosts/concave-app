'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { band, BAND_COLOR, driverLabel, firstSentence, to100, type Driver } from './types';

/**
 * Driver tiles: compact clickable grid — name, big score, RAG color edge,
 * one-line verdict. Clicking a tile focuses ONLY that driver's detail panel
 * (the page renders it below the grid); clicking again collapses it.
 */
export default function DriverTiles({
  drivers,
  keys,
  selected,
  onSelect,
}: {
  drivers: Record<string, Driver>;
  keys: string[];
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
      {keys.map((key, i) => {
        const d = drivers[key];
        if (!d) return null;
        const s = to100(d.score);
        const color = BAND_COLOR[band(s)];
        const active = selected === key;
        return (
          <motion.button
            key={key}
            onClick={() => onSelect(active ? null : key)}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reduced ? 0 : i * 0.05 }}
            whileHover={reduced ? undefined : { y: -2 }}
            className="glass"
            aria-expanded={active}
            aria-label={`${driverLabel(key)}: ${s} out of 100. ${active ? 'Collapse' : 'Expand'} details`}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              padding: '16px 18px',
              borderLeft: `3px solid ${color}`,
              outline: active ? '1px solid var(--accent)' : 'none',
              outlineOffset: -1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                {driverLabel(key)}
              </span>
              <span className="font-bebas" style={{ fontSize: 30, color, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{s}</span>
            </div>
            <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ width: `${s}%`, height: '100%', borderRadius: 99, background: color }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <p
                style={{
                  flex: 1, fontFamily: 'var(--font-poppins)', fontSize: 11.5, color: 'var(--text-secondary)',
                  margin: 0, lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}
              >
                {firstSentence(d.summary)}
              </p>
              <motion.span animate={{ rotate: active ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexShrink: 0, marginTop: 1 }}>
                <ChevronDown size={14} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
              </motion.span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
