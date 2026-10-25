'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { BAND_LABEL, statusColor, type SubKpi } from './types';

const THRESHOLD_NOTE = 'Fix <40 · Watch 40–69 · Strong ≥70';

/** Sub-KPI row: status dot · name · score/100 · RAG pill · chevron → expands to verdict + evidence + threshold note. */
export default function KpiRow({ kpi }: { kpi: SubKpi }) {
  const [open, setOpen] = useState(false);
  const color = statusColor(kpi.status);
  const pill = BAND_LABEL[kpi.status] ?? kpi.status;

  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)', borderLeft: `3px solid ${color}`, borderRadius: 8, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1, minWidth: 0 }}>
          {kpi.name}
        </span>
        <span className="font-bebas" style={{ fontSize: 20, color, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>
          {Math.round(kpi.score)}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 2 }}>/100</span>
        </span>
        <span style={{
          fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color,
          background: `${color}1f`, padding: '3px 10px', borderRadius: 99, letterSpacing: '0.5px', flexShrink: 0,
        }}>
          {pill}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexShrink: 0 }}>
          <ChevronDown size={14} color="var(--text-muted)" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '2px 14px 12px 34px' }}>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.55 }}>
                {kpi.verdict}
              </p>
              {kpi.evidence && (
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.55, borderLeft: `2px solid ${color}55`, paddingLeft: 10, fontStyle: 'italic' }}>
                  {kpi.evidence}
                </p>
              )}
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'var(--text-muted)', margin: 0, letterSpacing: '0.3px' }}>
                {THRESHOLD_NOTE}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
