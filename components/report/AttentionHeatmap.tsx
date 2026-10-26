'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { AttentionMetrics } from '@/lib/attention-types';

/**
 * Phase E1 — measured (model-predicted) attention panel, rendered in the
 * Attention driver section only when the stored intake carries attention_metrics.
 */
export default function AttentionHeatmap({ metrics }: { metrics: AttentionMetrics }) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const regions = metrics.regions.slice(0, 10);

  return (
    <div className="glass" style={{ padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Predicted Attention Heatmap
          <span style={{ fontSize: 10, fontWeight: 700, color: '#7C8CFF', background: 'rgba(124,140,255,0.12)', border: '1px solid rgba(124,140,255,0.3)', padding: '3px 10px', borderRadius: 99, marginLeft: 10, textTransform: 'uppercase', letterSpacing: '0.6px', verticalAlign: 'middle' }}>
            Model-predicted
          </span>
        </h3>
        <button
          type="button"
          onClick={() => setShowHeatmap(v => !v)}
          className="glass"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, border: '1px solid var(--glass-border)', cursor: 'pointer', fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)' }}
        >
          {showHeatmap ? <EyeOff size={13} /> : <Eye size={13} />}
          {showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, alignItems: 'start' }}>
        {/* Image + overlay */}
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#0B101F' }}>
          {metrics.image_data_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={metrics.image_data_url} alt="Analyzed creative" style={{ display: 'block', width: '100%' }} />
          ) : null}
          {showHeatmap && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={metrics.heatmap_data_url}
              alt="Predicted attention heatmap overlay"
              style={metrics.image_data_url
                ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
                : { display: 'block', width: '100%' }}
            />
          )}
        </div>

        {/* Region table */}
        <div>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.6, margin: '0 0 12px', borderLeft: '3px solid #7C8CFF', paddingLeft: 10 }}>
            {metrics.top_focus}
          </p>
          {regions.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '6px 8px 6px 0', borderBottom: '1px solid var(--border-subtle)' }}>Text region (OCR)</th>
                  <th style={{ textAlign: 'right', fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>Attention</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-secondary)', padding: '7px 8px 7px 0', borderBottom: '1px solid var(--border-subtle)', wordBreak: 'break-word' }}>{r.label}</td>
                    <td style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: '#7C8CFF', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)', textAlign: 'right', whiteSpace: 'nowrap' }}>{(r.share * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', padding: '8px 8px 2px 0' }}>All text combined</td>
                  <td style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', padding: '8px 0 2px', textAlign: 'right' }}>{(metrics.text_attention_share * 100).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              No text regions detected by OCR.
            </p>
          )}
        </div>
      </div>

      <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: '14px 0 0' }}>
        Predicted attention — MSI-Net, trained on the SALICON/MIT academic benchmarks (mouse-tracking proxy data), not real eye-tracking.
      </p>
    </div>
  );
}
