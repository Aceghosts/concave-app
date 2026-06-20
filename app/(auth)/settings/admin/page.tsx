'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type ApiStatus = { status: string; detail: string };
type HealthData = Record<string, ApiStatus>;

const API_KEYS = [
  { key: 'claude',    name: 'Claude API' },
  { key: 'supabase',  name: 'Supabase' },
  { key: 'meta',      name: 'Meta Graph API' },
  { key: 'pptxgenjs', name: 'pptxgenjs' },
];

function statusColor(status: string) {
  if (status === 'connected' || status === 'healthy') return '#3EB489';
  if (status === 'partial') return '#F59E0B';
  if (status === 'pending') return '#F59E0B';
  return '#EF4444';
}

function StatusDot({ status }: { status: string }) {
  const color = statusColor(status);
  return (
    <div
      className={status === 'connected' || status === 'healthy' ? 'pulse-dot' : ''}
      style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }}
    />
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function AdminPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => { setHealth(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '36px 40px', maxWidth: 900 }}>
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ marginBottom: 28 }}
      >
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Settings</p>
        <h1 className="font-bebas" style={{ fontSize: 36, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1 }}>ADMIN</h1>
      </motion.div>

      {/* API Status Cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', margin: 0, letterSpacing: '0.5px' }}>
          API Connections
        </h2>
        {loading && (
          <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)' }}>checking...</span>
        )}
        {!loading && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setLoading(true); fetch('/api/health').then(r => r.json()).then(d => { setHealth(d); setLoading(false); }); }}
            style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: '#3EB489', background: 'rgba(62,180,137,0.08)', border: '1px solid rgba(62,180,137,0.2)', borderRadius: 8, padding: '3px 10px', cursor: 'pointer' }}
          >
            Refresh
          </motion.button>
        )}
      </div>

      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 32 }}
      >
        {API_KEYS.map(({ key, name }) => {
          const api = health?.[key];
          const status = loading ? 'checking' : (api?.status ?? 'error');
          const detail = loading ? 'Checking connection...' : (api?.detail ?? 'Unknown');
          const color = loading ? 'var(--text-muted)' : statusColor(status);

          return (
            <motion.div key={key} variants={cardVariants} whileHover={{ y: -2 }} className="glass" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {loading
                  ? <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.4, flexShrink: 0 }} />
                  : <StatusDot status={status} />
                }
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{name}</p>
                <span style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600,
                  color, background: loading ? 'rgba(255,255,255,0.05)' : `${color}18`,
                  padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
                }}>
                  {loading ? '...' : status}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{detail}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Token Health placeholder */}
      <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14, letterSpacing: '0.5px' }}>
        Token Health
      </h2>
      <div className="glass" style={{ padding: '28px', textAlign: 'center', opacity: 0.6 }}>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Token health will show here once clients are connected via Supabase
        </p>
      </div>
    </div>
  );
}
