'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

// Concave 2.0 dark glass login — visual layer only; credential logic unchanged.
const label: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--input-bg)',
  border: '1.5px solid var(--input-border)',
  borderRadius: 12,
  padding: '12px 14px',
  fontFamily: 'var(--font-poppins)',
  fontSize: 14,
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ALLOWED = [
    { email: 'admin@concave.ai', password: 'concave2025' },
    { email: 'saadconvex@gmail.com', password: 'concave2025' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));
    const match = ALLOWED.find(u => u.email === email.toLowerCase().trim() && u.password === password);
    if (match) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. This tool is invite-only.');
      setLoading(false);
    }
  }

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = '#3DDCC8';
    e.target.style.boxShadow = '0 0 0 3px rgba(61,220,200,0.14)';
    e.target.style.background = 'rgba(255,255,255,0.08)';
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'var(--input-border)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'var(--input-bg)';
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: 24,
      background: 'radial-gradient(120% 90% at 50% 0%, #10182E 0%, #070A14 70%)',
    }}>
      {/* Ambient glows */}
      <div aria-hidden style={{
        position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
        width: 1000, height: 600, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(closest-side, rgba(61,220,200,0.14), transparent 70%)',
        filter: 'blur(48px)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', right: '-15%', bottom: '-10%',
        width: 700, height: 500, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(closest-side, rgba(124,140,255,0.13), transparent 70%)',
        filter: 'blur(56px)',
      }} />
      {/* Faint grid texture */}
      <div aria-hidden style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.7,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 420,
          border: '1px solid transparent',
          background:
            'linear-gradient(180deg, rgba(16,24,46,0.88), rgba(10,14,26,0.92)) padding-box, linear-gradient(155deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.07) 32%, rgba(61,220,200,0.25) 72%, rgba(124,140,255,0.32) 100%) border-box',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          borderRadius: 24,
          boxShadow: '0 24px 72px rgba(0,0,0,0.55), 0 0 48px rgba(61,220,200,0.10), inset 0 1px 0 rgba(255,255,255,0.10)',
          padding: '44px 40px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <span aria-hidden style={{
              display: 'inline-block', width: 40, height: 40, borderRadius: 11,
              background: 'var(--gradient-brand)',
              boxShadow: '0 0 24px rgba(61,220,200,0.35)',
              marginBottom: 14,
            }} />
            <span style={{
              fontFamily: 'var(--font-bebas)', fontWeight: 600, fontSize: 32,
              letterSpacing: '-0.02em', display: 'block', lineHeight: 1, color: 'var(--text-primary)',
            }}>
              Concave
            </span>
            <p style={{ fontFamily: 'var(--font-poppins)', fontWeight: 400, fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
              Campaign Analysis Engine
            </p>
          </motion.div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 28 }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label style={label}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@agency.com"
                style={{ ...inputStyle, paddingLeft: 40 }}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={label}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type={showPw ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                onFocus={onFocus} onBlur={onBlur}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '10px 14px',
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.30)',
                borderRadius: 10,
                fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#F87171', textAlign: 'center',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: 4, fontSize: 15, borderRadius: 12, opacity: loading ? 0.85 : 1 }}
          >
            {loading ? <><Loader2 size={16} className="spin" /> Signing in...</> : 'Sign In →'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-poppins)', fontSize: 11, color: 'var(--text-muted)', marginTop: 24 }}>
          Internal tool · Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
}
