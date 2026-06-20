'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Plus, ArrowRight, Sparkles } from 'lucide-react';
import CountUp from '@/components/CountUp';

const STATS = [
  { label: 'Total Analyses', value: 0, decimals: 0, trend: '—', up: null, color: '#3EB489' },
  { label: 'Avg Score',      value: 0, decimals: 1, trend: '—', up: null, color: '#3EB489' },
  { label: 'This Month',     value: 0, decimals: 0, trend: '—', up: null, color: '#a78bfa' },
  { label: 'Top Score',      value: 0, decimals: 1, trend: '—', up: null, color: '#22d3ee' },
];

const RECENT: { id: string; name: string; date: string; score: number; label: string; by: string }[] = [];
const META:   { label: string; value: string }[] = [];

function scoreColor(s: number) {
  if (s >= 8) return '#3EB489';
  if (s >= 6) return '#F59E0B';
  return '#EF4444';
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 26 } },
};

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1260, margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}
      >
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Welcome back, Team</p>
          <h1 className="font-bebas shimmer-text" style={{ fontSize: 42, letterSpacing: 1, lineHeight: 1 }}>DASHBOARD</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/analyze')}
          className="btn-primary"
          style={{ padding: '11px 22px', fontSize: 14 }}
        >
          <Plus size={15} /> New Analysis
        </motion.button>
      </motion.div>

      {/* Stat strip */}
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}
      >
        {STATS.map((s) => (
          <motion.div
            key={s.label} variants={fadeUp}
            whileHover={{ y: -3 }}
            style={{
              position: 'relative', overflow: 'hidden',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid var(--glass-border)',
              borderTop: `2px solid ${s.color}`,
              borderRadius: 18,
              boxShadow: 'var(--glass-shadow)',
              padding: '22px 24px 20px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            {/* Ghost number */}
            <span className="number-ghost" style={{ color: s.color, opacity: 0.06, WebkitTextStroke: `1px ${s.color}` }}>
              {s.value.toFixed(s.decimals)}
            </span>

            <p className="label" style={{ marginBottom: 14, color: s.color }}>{s.label}</p>
            <div className="font-bebas" style={{ fontSize: 52, lineHeight: 1, color: 'var(--text-primary)', letterSpacing: -1, marginBottom: 10 }}>
              <CountUp target={s.value} decimals={s.decimals} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {s.up === true  && <TrendingUp  size={12} color="#3EB489" />}
              {s.up === false && <TrendingDown size={12} color="#EF4444" />}
              <span style={{
                fontFamily: 'var(--font-poppins)', fontSize: 11,
                color: s.up === true ? '#3EB489' : s.up === false ? '#EF4444' : 'var(--text-muted)',
                fontWeight: 500,
              }}>
                {s.trend} vs last month
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, type: 'spring', stiffness: 300, damping: 26 }}
          className="glass" style={{ padding: '26px 28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Analyses</h2>
            <button onClick={() => router.push('/history')}
              style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: '#3EB489', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </button>
          </div>

          {RECENT.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 0' }}>
              <Sparkles size={26} color="#3EB489" style={{ margin: '0 auto 12px', opacity: 0.45 }} />
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>No analyses yet</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/analyze')}
                className="btn-primary" style={{ padding: '9px 20px' }}>
                Start your first analysis
              </motion.button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 70px', gap: 8, padding: '0 10px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                {['Campaign', 'Date', 'Score', 'By'].map(h => (
                  <p key={h} className="label">{h}</p>
                ))}
              </div>
              {RECENT.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.06 }}
                  whileHover={{ backgroundColor: 'rgba(62,180,137,0.04)', x: 2 }}
                  onClick={() => router.push(`/analyze/${item.id}`)}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 70px', gap: 8, padding: '12px 10px', borderRadius: 10, cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s, transform 0.15s' }}
                >
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)' }}>{item.date}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="font-bebas" style={{ fontSize: 20, color: scoreColor(item.score), lineHeight: 1 }}>{item.score}</span>
                    <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: scoreColor(item.score), background: `${scoreColor(item.score)}16`, padding: '2px 8px', borderRadius: 99 }}>{item.label}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)' }}>{item.by}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Meta Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, type: 'spring', stiffness: 300, damping: 26 }}
          className="glass" style={{ padding: '26px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
            <h2 style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Meta Snapshot</h2>
          </div>

          {META.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 0', gap: 12 }}>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                Connect Meta in<br />Settings → Clients
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/settings/clients')}
                style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: '#3EB489', background: 'var(--accent-dim)', border: '1px solid rgba(62,180,137,0.18)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}
              >
                Connect Meta →
              </motion.button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {META.map(m => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--accent-dim)', border: '1px solid rgba(62,180,137,0.10)', borderRadius: 10 }}>
                    <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{m.label}</span>
                    <span className="font-bebas" style={{ fontSize: 20, color: '#3EB489', lineHeight: 1 }}>{m.value}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>Last synced just now</p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
