'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, BarChart3 } from 'lucide-react';

// TODO: fetch from Supabase — select * from analyses order by created_at desc
const CAMPAIGNS: { id: string; name: string; date: string; score: number; status: string; client: string }[] = [];

function scoreColor(score: number) {
  if (score >= 8) return '#3EB489';
  if (score >= 6) return '#F59E0B';
  return '#EF4444';
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function HistoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = CAMPAIGNS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            All Clients
          </p>
          <h1 className="font-bebas" style={{ fontSize: 36, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1 }}>
            HISTORY
          </h1>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="input"
            style={{ paddingLeft: 40, paddingRight: 16, width: 240 }}
          />
        </div>
      </motion.div>

      {/* Count */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}
      >
        {filtered.length} {filtered.length === 1 ? 'analysis' : 'analyses'} found
      </motion.p>

      {/* Grid */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}
      >
        {filtered.map((campaign) => (
          <motion.div
            key={campaign.id}
            variants={cardVariants}
            whileHover={{ y: -3 }}
            onClick={() => router.push(`/analyze/${campaign.id}`)}
            className="glass"
            style={{ padding: '24px 28px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {campaign.name}
                </p>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {campaign.client} · {campaign.date}
                </p>
              </div>
              <div className="font-bebas" style={{ fontSize: 48, lineHeight: 1, color: scoreColor(campaign.score), flexShrink: 0 }}>
                {campaign.score}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600,
                color: scoreColor(campaign.score),
                background: `${scoreColor(campaign.score)}18`,
                padding: '4px 12px', borderRadius: 20,
              }}>
                {campaign.status}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <BarChart3 size={13} />
                <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12 }}>View report</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, color: 'var(--text-muted)' }}>
            No campaigns match your search.
          </p>
        </motion.div>
      )}
    </div>
  );
}
