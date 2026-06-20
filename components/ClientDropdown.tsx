'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Plus, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useClients } from '@/context/ClientContext';

export default function ClientDropdown() {
  const { clients, activeClient, setActiveClient } = useClients();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const noClients = clients.length === 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          background: noClients ? 'rgba(62,180,137,0.08)' : 'rgba(255,255,255,0.07)',
          border: noClients ? '1px dashed rgba(62,180,137,0.35)' : '1px solid rgba(255,255,255,0.10)',
          borderRadius: 12,
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {noClients ? (
          <>
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'rgba(62,180,137,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={13} color="#3EB489" />
            </div>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, flex: 1, textAlign: 'left' }}>
              No clients yet
            </p>
            <Plus size={13} color="#3EB489" />
          </>
        ) : (
          <>
            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #3EB489, #6DC4A8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 13, color: '#fff', lineHeight: 1 }}>
                {activeClient?.name[0] ?? clients[0].name[0]}
              </span>
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeClient?.name ?? clients[0].name}
              </p>
              <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                {activeClient?.industry ?? clients[0].industry}
              </p>
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} color="rgba(255,255,255,0.35)" />
            </motion.div>
          </>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#141C2E',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 14,
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 16px 48px rgba(0,0,0,0.50)',
            }}
          >
            {noClients ? (
              <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                <Building2 size={22} color="rgba(255,255,255,0.20)" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 14px', lineHeight: 1.5 }}>
                  No clients added yet.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setOpen(false); router.push('/settings/clients'); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px', background: 'linear-gradient(135deg, #3EB489, #6DC4A8)',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'var(--font-poppins)', fontSize: 12, fontWeight: 600, color: '#fff',
                  }}
                >
                  <Plus size={13} /> Add your first client
                </motion.button>
              </div>
            ) : (
              <>
                <div style={{ padding: '6px' }}>
                  {clients.map((client, i) => {
                    const isActive = client.id === activeClient?.id;
                    return (
                      <motion.button
                        key={client.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { setActiveClient(client); setOpen(false); }}
                        whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: isActive ? 'rgba(62,180,137,0.10)' : 'transparent', outline: 'none',
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: isActive ? 'linear-gradient(135deg, #3EB489, #6DC4A8)' : 'rgba(255,255,255,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 14, color: isActive ? '#fff' : 'rgba(255,255,255,0.50)', lineHeight: 1 }}>
                            {client.name[0]}
                          </span>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                          <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', margin: 0 }}>
                            {client.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: client.metaConnected ? '#3EB489' : 'rgba(255,255,255,0.20)', flexShrink: 0 }} />
                            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'rgba(255,255,255,0.30)', margin: 0 }}>
                              {client.industry || 'No industry set'}
                            </p>
                          </div>
                        </div>
                        {isActive && <Check size={13} color="#3EB489" />}
                      </motion.button>
                    );
                  })}
                </div>
                <div style={{ padding: '8px 12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => { setOpen(false); router.push('/settings/clients'); }}
                    style={{
                      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-poppins)', fontSize: 11, color: '#3EB489', fontWeight: 600,
                      letterSpacing: '0.5px', padding: '4px 0',
                    }}
                  >
                    + Manage clients
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
