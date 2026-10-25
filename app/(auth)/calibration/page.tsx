'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Plus } from 'lucide-react';
import { useClients } from '@/context/ClientContext';

type PastCampaign = {
  id: string;
  client_id: string | null;
  name: string;
  channel: string | null;
  outcome_metrics: Record<string, unknown>;
  creative_traits: Record<string, unknown>;
  created_at: string;
};

const poppins = { fontFamily: 'var(--font-poppins)' } as const;

/* ---------- CSV parsing (RFC 4180-ish: quoted fields, escaped quotes, CRLF) ---------- */

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { pushField(); i++; continue; }
    if (ch === '\r') { if (text[i + 1] === '\n') i++; pushRow(); i++; continue; }
    if (ch === '\n') { pushRow(); i++; continue; }
    field += ch; i++;
  }
  if (field !== '' || row.length > 0) pushRow();
  // Drop fully empty trailing rows
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/* ---------- Column mapping ---------- */

const FIELDS = [
  { key: 'name', label: 'Campaign name', required: true },
  { key: 'channel', label: 'Channel' },
  { key: 'ctr', label: 'CTR', metric: true },
  { key: 'engagement_rate', label: 'Engagement rate', metric: true },
  { key: 'roas', label: 'ROAS', metric: true },
  { key: 'notes', label: 'Notes', metric: true },
  { key: 'traits', label: 'Creative traits' },
] as const;
type FieldKey = (typeof FIELDS)[number]['key'];

function guessMapping(headers: string[]): Record<FieldKey, number> {
  const find = (...needles: string[]) =>
    headers.findIndex((h) => needles.some((n) => h.toLowerCase().replace(/[\s_-]/g, '').includes(n)));
  return {
    name: find('name', 'campaign', 'title'),
    channel: find('channel', 'platform', 'medium'),
    ctr: find('ctr', 'clickthrough'),
    engagement_rate: find('engagement'),
    roas: find('roas', 'returnonad'),
    notes: find('notes', 'comment', 'result'),
    traits: find('trait', 'creative', 'style'),
  };
}

function toMetric(raw: string): number | string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const n = parseFloat(t.replace(/[%,x]/gi, '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : t;
}

function rowToPayload(cells: string[], mapping: Record<FieldKey, number>) {
  const cell = (k: FieldKey) => (mapping[k] >= 0 ? (cells[mapping[k]] ?? '').trim() : '');
  const metrics: Record<string, unknown> = {};
  for (const f of FIELDS) {
    if (!('metric' in f) || !f.metric) continue;
    const v = f.key === 'notes' ? cell('notes') || undefined : toMetric(cell(f.key));
    if (v !== undefined && v !== '') metrics[f.key] = v;
  }
  const traits = cell('traits');
  return {
    name: cell('name'),
    channel: cell('channel') || null,
    outcome_metrics: metrics,
    creative_traits: traits ? { description: traits } : {},
  };
}

/* ---------- Page ---------- */

export default function CalibrationPage() {
  const { clients } = useClients();
  const [entries, setEntries] = useState<PastCampaign[]>([]);
  const [tableMissing, setTableMissing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState('');
  const [filterClient, setFilterClient] = useState('');

  // CSV state
  const [csv, setCsv] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [mapping, setMapping] = useState<Record<FieldKey, number>>({ name: -1, channel: -1, ctr: -1, engagement_rate: -1, roas: -1, notes: -1, traits: -1 });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Manual form state
  const [form, setForm] = useState({ name: '', channel: '', ctr: '', engagement_rate: '', roas: '', notes: '' });

  const clientName = (id: string | null) => clients.find((c) => c.id === id)?.name ?? '—';

  async function load(client = filterClient) {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/past-campaigns${client ? `?client=${client}` : ''}`);
      const data = await res.json();
      if (!res.ok) {
        if (data?.tableMissing) setTableMissing(true);
        else setLoadError(data?.error || 'Failed to load past campaigns');
        setEntries([]);
      } else {
        setTableMissing(false);
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
    }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filterClient]);

  function onFile(file: File) {
    setStatus(null);
    file.text().then((text) => {
      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        setStatus({ ok: false, text: 'CSV needs a header row plus at least one data row.' });
        setCsv(null);
        return;
      }
      const headers = parsed[0].map((h) => h.trim());
      setCsv({ headers, rows: parsed.slice(1) });
      setMapping(guessMapping(headers));
    });
  }

  async function post(rows: ReturnType<typeof rowToPayload>[], onDone?: () => void) {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch('/api/past-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId || null, rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.tableMissing) setTableMissing(true);
        setStatus({ ok: false, text: data?.error || 'Import failed' });
      } else {
        setStatus({ ok: true, text: `Imported ${data.inserted} campaign${data.inserted === 1 ? '' : 's'}.` });
        onDone?.();
        load();
      }
    } catch (e) {
      setStatus({ ok: false, text: e instanceof Error ? e.message : 'Import failed' });
    }
    setBusy(false);
  }

  const preview = useMemo(() => {
    if (!csv) return null;
    const payloads = csv.rows.map((r) => rowToPayload(r, mapping));
    const valid = payloads.filter((p) => p.name);
    return { payloads, valid, skipped: payloads.length - valid.length };
  }, [csv, mapping]);

  function submitManual() {
    const metrics: Record<string, unknown> = {};
    for (const k of ['ctr', 'engagement_rate', 'roas'] as const) {
      const v = toMetric(form[k]);
      if (v !== undefined) metrics[k] = v;
    }
    if (form.notes.trim()) metrics.notes = form.notes.trim();
    post(
      [{ name: form.name.trim(), channel: form.channel.trim() || null, outcome_metrics: metrics, creative_traits: {} }],
      () => setForm({ name: '', channel: '', ctr: '', engagement_rate: '', roas: '', notes: '' })
    );
  }

  const metricText = (m: Record<string, unknown>) =>
    Object.entries(m).filter(([k]) => k !== 'notes').map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' · ') || '—';

  const selectStyle = { width: '100%' } as const;

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 28 }}>
        <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Past campaign results · feeds client-calibrated analysis</p>
        <h1 className="font-bebas" style={{ fontSize: 36, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1 }}>CALIBRATION</h1>
      </motion.div>

      {tableMissing && (
        <div className="glass-card" style={{ padding: '18px 24px', marginBottom: 20, border: '1px solid #F59E0B55' }}>
          <p style={{ ...poppins, fontSize: 14, fontWeight: 600, color: '#F59E0B', margin: 0 }}>
            The past_campaigns table doesn&apos;t exist yet.
          </p>
          <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}>
            Run <code>supabase/past_campaigns.sql</code> in the Supabase SQL Editor, then reload this page.
          </p>
        </div>
      )}

      {status && (
        <p style={{ ...poppins, fontSize: 13, fontWeight: 600, color: status.ok ? '#3DDCC8' : '#EF4444', marginBottom: 16 }}>{status.text}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* CSV import */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 className="font-bebas" style={{ fontSize: 20, letterSpacing: 1, color: 'var(--text-primary)', margin: '0 0 6px' }}>CSV IMPORT</h2>
          <p style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            Export from Ads Manager or a sheet. Expected columns (any order, mapped below): name, channel, ctr, engagement rate, roas, notes, creative traits.
          </p>

          <label className="label" style={{ display: 'block', marginBottom: 6 }}>Assign to client (applies to all imported rows)</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="input" style={{ ...selectStyle, marginBottom: 14 }}>
            <option value="">No client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Upload size={15} /> Choose CSV file
            <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
          </label>

          {csv && preview && (
            <div style={{ marginTop: 18 }}>
              <p style={{ ...poppins, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px' }}>Map columns</p>
              {FIELDS.map((f) => (
                <div key={f.key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)' }}>{f.label}{'required' in f && f.required ? ' *' : ''}</span>
                  <select
                    value={mapping[f.key]}
                    onChange={(e) => setMapping((m) => ({ ...m, [f.key]: Number(e.target.value) }))}
                    className="input"
                    style={selectStyle}
                  >
                    <option value={-1}>— not in file —</option>
                    {csv.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                  </select>
                </div>
              ))}

              <p style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 8px' }}>
                Preview ({Math.min(5, preview.valid.length)} of {preview.valid.length} rows{preview.skipped ? ` · ${preview.skipped} skipped: no name` : ''})
              </p>
              <div style={{ overflowX: 'auto' }}>
                {preview.valid.slice(0, 5).map((p, i) => (
                  <div key={i} style={{ ...poppins, fontSize: 12, color: 'var(--text-primary)', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <strong>{p.name}</strong>{p.channel ? ` · ${p.channel}` : ''} <span style={{ color: 'var(--text-muted)' }}>{metricText(p.outcome_metrics)}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn-primary"
                disabled={busy || mapping.name < 0 || preview.valid.length === 0}
                style={{ marginTop: 14, opacity: busy || mapping.name < 0 || preview.valid.length === 0 ? 0.5 : 1 }}
                onClick={() => post(preview.valid, () => setCsv(null))}
              >
                {busy ? 'Importing…' : `Import ${preview.valid.length} row${preview.valid.length === 1 ? '' : 's'}`}
              </button>
              {mapping.name < 0 && (
                <p style={{ ...poppins, fontSize: 12, color: '#F59E0B', marginTop: 8 }}>Map the campaign name column to import.</p>
              )}
            </div>
          )}
        </div>

        {/* Manual entry */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 className="font-bebas" style={{ fontSize: 20, letterSpacing: 1, color: 'var(--text-primary)', margin: '0 0 16px' }}>MANUAL ENTRY</h2>
          {([
            ['name', 'Campaign name *'],
            ['channel', 'Channel (e.g. Meta, TikTok, TVC)'],
            ['ctr', 'CTR (e.g. 1.8 or 1.8%)'],
            ['engagement_rate', 'Engagement rate'],
            ['roas', 'ROAS'],
            ['notes', 'Notes / outcome'],
          ] as const).map(([key, label]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <label className="label" style={{ display: 'block', marginBottom: 4 }}>{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
          ))}
          <button
            className="btn-primary"
            disabled={busy || !form.name.trim()}
            style={{ marginTop: 6, opacity: busy || !form.name.trim() ? 0.5 : 1 }}
            onClick={submitManual}
          >
            <Plus size={15} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            Add campaign
          </button>
        </div>
      </div>

      {/* Existing entries */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 className="font-bebas" style={{ fontSize: 20, letterSpacing: 1, color: 'var(--text-primary)', margin: 0 }}>STORED CAMPAIGNS</h2>
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="input" style={{ width: 200 }}>
            <option value="">All clients</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading && <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>}
        {!loading && loadError && <p style={{ ...poppins, fontSize: 13, color: '#EF4444' }}>{loadError}</p>}
        {!loading && !loadError && !tableMissing && entries.length === 0 && (
          <p style={{ ...poppins, fontSize: 13, color: 'var(--text-muted)' }}>
            No past campaigns stored yet. Import a CSV or add one manually — they&apos;ll be used as real comparables in future analyses.
          </p>
        )}
        {!loading && entries.map((e) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr 100px', gap: 16, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <p style={{ ...poppins, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{e.name}</p>
              {typeof e.outcome_metrics?.notes === 'string' && (
                <p style={{ ...poppins, fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{e.outcome_metrics.notes}</p>
              )}
            </div>
            <span style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)' }}>{e.channel ?? '—'} · {clientName(e.client_id)}</span>
            <span style={{ ...poppins, fontSize: 12, color: 'var(--text-primary)' }}>{metricText(e.outcome_metrics)}</span>
            <span style={{ ...poppins, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
              {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
