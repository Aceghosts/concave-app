'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Megaphone, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useClients } from '@/context/ClientContext';

type Status = { configured: boolean; missing: string[] };
type SyncResult = { synced?: number; skipped?: number; message?: string; error?: string };

const SETUP_STEPS = [
  'Create a Meta app at developers.facebook.com (type: Business).',
  'Complete Meta Business Verification for the owning Business Manager.',
  'Add the Marketing API product to the app and request Ads Management Standard Access (app review — typically takes WEEKS, plan for it).',
  'Generate an access token with ads_read permission (Graph API Explorer or a System User token).',
  'Set META_APP_ID, META_APP_SECRET and META_ACCESS_TOKEN as environment variables in Vercel (and .env.local for local dev), then redeploy.',
];

export default function MetaSettingsPage() {
  const { activeClient } = useClients();
  const [status, setStatus] = useState<Status | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [adAccountId, setAdAccountId] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    fetch('/api/meta/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch((e) => setStatusError(e instanceof Error ? e.message : 'Failed to load status'));
  }, []);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch('/api/meta/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adAccountId, clientId: activeClient?.id ?? null }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Sync request failed' });
    } finally {
      setSyncing(false);
    }
  }

  const label = { fontFamily: 'var(--font-poppins)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', margin: '0 0 8px' };

  return (
    <div style={{ padding: '36px 40px', maxWidth: 820 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Megaphone size={22} color="#3DDCC8" />
          <h1 className="font-bebas" style={{ fontSize: 30, margin: 0, color: 'var(--text-primary)' }}>Meta Ads</h1>
        </div>
        <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: 1.6 }}>
          Sync real ad-level results (impressions, CTR, CPM, spend, actions) from the Meta Marketing API into this client&apos;s calibration history. Only measured numbers Meta returns are stored — nothing is estimated.
        </p>

        {/* Connection state */}
        <div className="glass" style={{ padding: '22px 26px', marginBottom: 20 }}>
          <p style={label}>Connection</p>
          {statusError ? (
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#EF4444', margin: 0 }}>Could not check status: {statusError}</p>
          ) : !status ? (
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={14} className="animate-spin" /> Checking…
            </p>
          ) : status.configured ? (
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#3DDCC8', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={15} /> Configured — META_APP_ID, META_APP_SECRET and META_ACCESS_TOKEN are set.
            </p>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#F59E0B', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={15} /> Not configured — missing: {status.missing.join(', ')}
              </p>
              <p style={label}>Setup steps</p>
              <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SETUP_STEPS.map((s, i) => (
                  <li key={i} style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s}</li>
                ))}
              </ol>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: '14px 0 0' }}>
                Honest note: full Marketing API access requires Meta app review, which typically takes weeks. Until the env vars are set, this page cannot sync anything — there is no demo mode and no sample data.
              </p>
            </>
          )}
        </div>

        {/* Sync (configured only) */}
        {status?.configured && (
          <div className="glass" style={{ padding: '22px 26px' }}>
            <p style={label}>Sync ad insights (last 90 days)</p>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.55 }}>
              Synced ads land in Calibration as past campaigns for{' '}
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeClient?.name ?? 'no client (unassigned)'}</span>, deduped by ad name.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="input"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                placeholder="Ad account ID (e.g. 1234567890 or act_1234567890)"
                style={{ flex: 1, minWidth: 260 }}
              />
              <motion.button
                whileHover={{ scale: adAccountId.trim() && !syncing ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSync}
                disabled={!adAccountId.trim() || syncing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRadius: 12,
                  border: 'none', cursor: adAccountId.trim() && !syncing ? 'pointer' : 'not-allowed',
                  background: adAccountId.trim() ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.06)',
                  color: adAccountId.trim() ? '#06281F' : 'var(--text-muted)',
                  fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 600,
                }}
              >
                {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {syncing ? 'Syncing…' : 'Sync'}
              </motion.button>
            </div>

            {result && (
              <div style={{
                marginTop: 14, padding: '12px 14px', borderRadius: 10,
                background: result.error ? 'rgba(239,68,68,0.08)' : 'rgba(61,220,200,0.08)',
                border: `1px solid ${result.error ? 'rgba(239,68,68,0.3)' : 'rgba(61,220,200,0.3)'}`,
              }}>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12.5, color: result.error ? '#EF4444' : '#3DDCC8', margin: 0, lineHeight: 1.55 }}>
                  {result.error
                    ? result.error
                    : result.message ?? `Synced ${result.synced} ad${result.synced === 1 ? '' : 's'}${result.skipped ? `, skipped ${result.skipped} already stored` : ''}.`}
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
