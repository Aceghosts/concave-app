'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function MeshBackground({ highOpacity = false }: { highOpacity?: boolean }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const m = highOpacity ? 3.5 : 1;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Rich base gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark
          ? 'radial-gradient(ellipse at 20% 50%, #0d1f2d 0%, #080C14 60%)'
          : 'radial-gradient(ellipse at 20% 50%, #e8f5ef 0%, #F0F4F8 60%)',
        transition: 'background 0.5s ease',
      }} />

      {/* Orb 1 — mint, top-right */}
      <motion.div
        animate={{ x: [0, 70, -30, 0], y: [0, -50, 35, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: -100, right: -80,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, #3EB489 0%, transparent 65%)',
          opacity: (dark ? 0.18 : 0.14) * m,
          filter: 'blur(55px)',
        }}
      />
      {/* Orb 2 — cyan, bottom-left */}
      <motion.div
        animate={{ x: [0, -50, 60, 0], y: [0, 60, -40, 0] }}
        transition={{ duration: 24, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: -80, left: -60,
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, #22d3ee 0%, transparent 65%)',
          opacity: (dark ? 0.14 : 0.10) * m,
          filter: 'blur(65px)',
        }}
      />
      {/* Orb 3 — purple, center */}
      <motion.div
        animate={{ x: [0, 80, -60, 0], y: [0, -70, 50, 0] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '38%', left: '38%',
          width: 450, height: 450, borderRadius: '50%',
          background: 'radial-gradient(circle, #a78bfa 0%, transparent 65%)',
          opacity: (dark ? 0.12 : 0.08) * m,
          filter: 'blur(75px)',
        }}
      />
      {/* Orb 4 — mint teal, top-left */}
      <motion.div
        animate={{ x: [0, 40, -25, 0], y: [0, 30, -50, 0] }}
        transition={{ duration: 22, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '8%', left: '8%',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, #6DC4A8 0%, transparent 65%)',
          opacity: (dark ? 0.10 : 0.08) * m,
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}
