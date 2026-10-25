'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, BarChart3, CheckSquare, Square, GitCompare } from 'lucide-react';

type Campaign = { id: string; name: string; date: string; score: number; status: string; client: string };

function scoreColor(score: number) {
  if (score >= 8) return '#3DDCC8';
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  // Compare selection: exactly 2 analyses -> /compare?a=&b=
  const [selected, setSelected] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(x => x !== id)
      : sel.length >= 2 ? sel // cap at 2
      : [...sel, id]
    );
  }

  useEffect(() => {
    fetch('/api/analyses')
      .then(r => r.json())
      .then((rows) => {
        if (!Array.isArray(rows)) return;
        setCampaigns(rows.map((r: { id: string; campaign_name: string; overall_score: number | null; grade: string | null; created_at: string }) => ({
          id: r.id,
          name: r.campaign_name,
          date: new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          score: Number(r.overall_score ?? 0),
          status: r.grade ?? '—',
          client: 'All Clients',
        })));
      })
      .catch(() => {});
  }, []);

  const filtered = campaigns.filter((c) =>
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
              <button
                type="button"
                onClick={e => { e.stopPropagation(); toggleSelect(campaign.id); }}
                aria-label={selected.includes(campaign.id) ? 'Deselect for comparison' : 'Select for comparison'}
                aria-pressed={selected.includes(campaign.id)}
                title={selected.length >= 2 && !selected.includes(campaign.id) ? 'Two analyses already selected' : 'Select to compare'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                  marginRight: 10, flexShrink: 0, display: 'flex',
                  color: selected.includes(campaign.id) ? '#3DDCC8' : 'var(--text-muted)',
                  opacity: selected.length >= 2 && !selected.includes(campaign.id) ? 0.4 : 1,
                }}
              >
                {selected.includes(campaign.id) ? <CheckSquare size={17} /> : <Square size={17} />}
              </button>
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

      {/* Floating compare bar */}
      {selected.length === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            zIndex: 60, display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/compare?a=${selected[0]}&b=${selected[1]}`)}
            className="btn-primary"
            style={{ padding: '13px 26px', fontSize: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 24px rgba(61,220,200,0.35)' }}
          >
            <GitCompare size={15} /> Compare selected
          </motion.button>
          <button
            onClick={() => setSelected([])}
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(12px)', borderRadius: 10, padding: '12px 16px',
              fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </motion.div>
      )}

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
