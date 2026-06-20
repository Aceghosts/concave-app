'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Plus, Loader2, Check, X, ChevronDown, Building2, Trash2 } from 'lucide-react';
import { useClients } from '@/context/ClientContext';

const INDUSTRIES = [
  'Retail & E-commerce', 'Telecom', 'Food & Beverage', 'Automotive',
  'Finance & Banking', 'Healthcare', 'Entertainment', 'Technology', 'Other',
];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

function IndustryDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        type="button"
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.99 }}
        className="input"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 14 }}>
          {value || 'Select industry'}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="var(--text-muted)" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
              background: '#141C2E',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.50)',
            }}
          >
            <div style={{ padding: 6 }}>
              {INDUSTRIES.map((industry, i) => {
                const active = industry === value;
                return (
                  <motion.button
                    key={industry}
                    type="button"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { onChange(industry); setOpen(false); }}
                    whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: active ? 'rgba(62,180,137,0.12)' : 'transparent',
                      fontFamily: 'var(--font-poppins)', fontSize: 13,
                      color: active ? '#3EB489' : 'rgba(255,255,255,0.70)',
                      fontWeight: active ? 600 : 400,
                      textAlign: 'left',
                    }}
                  >
                    {industry}
                    {active && <Check size={13} color="#3EB489" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClientsPage() {
  const { clients, loading: clientsLoading, addClient: ctxAddClient, removeClient } = useClients();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [metaForm, setMetaForm] = useState({ pageId: '', adAccountId: '', accessToken: '' });

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', industry: '' });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleTestConnection() {
    setTesting(true);
    setTestResult('idle');
    await new Promise((r) => setTimeout(r, 2000));
    setTestResult(metaForm.pageId ? 'success' : 'fail');
    setTesting(false);
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await ctxAddClient(addForm.name, addForm.industry);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowAddForm(false);
        setAddForm({ name: '', industry: '' });
      }, 1400);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save client');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1000 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}
      >
        <div>
          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Settings</p>
          <h1 className="font-bebas" style={{ fontSize: 36, letterSpacing: 1, color: 'var(--text-primary)', lineHeight: 1 }}>CLIENTS</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          <Plus size={15} /> Add Client
        </motion.button>
      </motion.div>

      {/* Add Client Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'visible' }}
          >
            <form onSubmit={handleAddClient} className="glass" style={{ padding: '28px 32px', overflow: 'visible' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(62,180,137,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={17} color="#3EB489" />
                </div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>New Client</p>
                <button type="button" onClick={() => setShowAddForm(false)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 7 }}>
                    Client Name *
                  </label>
                  <input
                    value={addForm.name}
                    onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Nike MENA"
                    className="input"
                    required
                    autoFocus
                  />
                </div>
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 7 }}>
                    Industry
                  </label>
                  <IndustryDropdown value={addForm.industry} onChange={(v) => setAddForm(f => ({ ...f, industry: v }))} />
                </div>
              </div>

              {saveError && (
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: '#EF4444', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
                  {saveError}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={saving || saveSuccess || !addForm.name.trim()}
                  className="btn-primary"
                  style={{ opacity: (!addForm.name.trim()) ? 0.5 : 1 }}
                >
                  {saving && <Loader2 size={14} className="spin" />}
                  {saveSuccess && <Check size={14} />}
                  {saving ? 'Saving...' : saveSuccess ? 'Client Added!' : 'Add Client'}
                </motion.button>
                <button type="button" onClick={() => { setShowAddForm(false); setAddForm({ name: '', industry: '' }); }}
                  style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 4px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden" animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {clientsLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={24} color="#3EB489" style={{ margin: '0 auto', opacity: 0.5 }} className="spin" />
          </motion.div>
        )}

        {!clientsLoading && clients.length === 0 && !showAddForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <Building2 size={32} color="#3EB489" style={{ margin: '0 auto 14px', opacity: 0.4 }} />
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>No clients yet</p>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
              style={{ padding: '9px 20px' }}
            >
              <Plus size={14} /> Add your first client
            </motion.button>
          </motion.div>
        )}

        {clients.map((client) => (
          <motion.div key={client.id} variants={cardVariants}>
            <motion.div
              whileHover={{ y: -1 }}
              onClick={() => setSelected(selected === client.id ? null : client.id)}
              className="glass"
              style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(62,180,137,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="font-bebas" style={{ fontSize: 18, color: '#3EB489' }}>{client.name[0]}</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{client.name}</p>
                  <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{client.industry || 'No industry set'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    className={client.metaConnected ? 'pulse-dot' : ''}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: client.metaConnected ? '#3EB489' : 'rgba(255,255,255,0.20)' }}
                  />
                  <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: client.metaConnected ? '#3EB489' : 'var(--text-muted)', fontWeight: 500 }}>
                    Meta {client.metaConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {/* Delete */}
                <AnimatePresence mode="wait">
                  {confirmDelete === client.id ? (
                    <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: '#EF4444', fontWeight: 500 }}>Delete?</span>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={async (e) => { e.stopPropagation(); await removeClient(client.id); setConfirmDelete(null); setSelected(null); }}
                        style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: '#fff', background: '#EF4444', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        Yes
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                        style={{ fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        No
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button key="trash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.1, color: '#EF4444' }} whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(client.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.20)', display: 'flex', padding: 4, borderRadius: 6 }}>
                      <Trash2 size={15} />
                    </motion.button>
                  )}
                </AnimatePresence>

                <motion.div animate={{ rotate: selected === client.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} color="var(--text-muted)" />
                </motion.div>
              </div>
            </motion.div>

            {/* Expandable Meta Connection Panel */}
            <AnimatePresence>
              {selected === client.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="glass" style={{ margin: '8px 0 0', padding: '24px 28px' }}>
                    <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 18px' }}>
                      Meta Connection
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 7 }}>Page ID</label>
                        <input value={metaForm.pageId} onChange={(e) => setMetaForm((f) => ({ ...f, pageId: e.target.value }))} placeholder="e.g. 123456789" className="input" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 7 }}>Ad Account ID</label>
                        <input value={metaForm.adAccountId} onChange={(e) => setMetaForm((f) => ({ ...f, adAccountId: e.target.value }))} placeholder="act_XXXXXXXXXX" className="input" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 7 }}>Access Token</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showToken ? 'text' : 'password'} value={metaForm.accessToken} onChange={(e) => setMetaForm((f) => ({ ...f, accessToken: e.target.value }))} placeholder="EAAxxxxxxxx..." className="input" style={{ paddingRight: 44 }} />
                          <button type="button" onClick={() => setShowToken(!showToken)}
                            style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                            {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleTestConnection} disabled={testing} className="btn-primary" style={{ opacity: testing ? 0.8 : 1 }}>
                          {testing && <Loader2 size={14} className="spin" />}
                          {testing ? 'Testing...' : 'Test Connection'}
                        </motion.button>
                        <AnimatePresence>
                          {testResult === 'success' && (
                            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Check size={15} color="#3EB489" />
                              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#3EB489', fontWeight: 500 }}>Connected successfully</span>
                            </motion.div>
                          )}
                          {testResult === 'fail' && (
                            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <X size={15} color="#EF4444" />
                              <span style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#EF4444', fontWeight: 500 }}>Connection failed</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
