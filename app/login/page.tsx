'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import MeshBackground from '@/components/MeshBackground';

// Styles pinned to light values — card is always white glass regardless of theme
const label: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-poppins)', fontSize: 11, fontWeight: 600,
  color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(241,245,249,0.70)',
  border: '1.5px solid rgba(0,0,0,0.08)',
  borderRadius: 12,
  padding: '11px 14px',
  fontFamily: 'var(--font-poppins)',
  fontSize: 14,
  color: '#0F172A',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
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
    e.target.style.borderColor = '#3EB489';
    e.target.style.boxShadow = '0 0 0 3px rgba(62,180,137,0.15)';
    e.target.style.background = 'rgba(255,255,255,0.90)';
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'rgba(0,0,0,0.08)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'rgba(241,245,249,0.70)';
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: 24,
      background: 'var(--bg-base)',
    }}>
      <MeshBackground highOpacity />

      {/* Dot grid texture */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(62,180,137,0.12) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 420,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.70)',
          borderRadius: 28,
          boxShadow: '0 24px 72px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,1)',
          padding: '44px 40px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <span className="shimmer-text font-bebas" style={{ fontSize: 44, letterSpacing: 2, display: 'block', lineHeight: 1 }}>
              CONCAVE
            </span>
            <p style={{ fontFamily: 'var(--font-poppins)', fontWeight: 400, fontSize: 13, color: '#64748B', marginTop: 6 }}>
              Campaign Analysis Engine
            </p>
          </motion.div>
        </div>

        <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginBottom: 28 }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label style={label}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
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
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                type={showPw ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                onFocus={onFocus} onBlur={onBlur}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 4 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.20)',
                borderRadius: 10,
                fontFamily: 'var(--font-poppins)', fontSize: 13, color: '#DC2626', textAlign: 'center',
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
            style={{ width: '100%', padding: '13px', marginTop: 4, fontSize: 15, borderRadius: 14, opacity: loading ? 0.85 : 1 }}
          >
            {loading ? <><Loader2 size={16} className="spin" /> Signing in...</> : 'Sign In →'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'var(--font-poppins)', fontSize: 11, color: '#94A3B8', marginTop: 24 }}>
          Internal tool · Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
}
