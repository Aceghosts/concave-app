'use client';

import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ClientProvider } from '@/context/ClientContext';

/** Fixed ambient color field — Concave 2.0: gives the glass something to blur. */
export function GlowBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(42% 34% at 10% 6%, rgba(61,220,200,0.08) 0%, transparent 70%),' +
          'radial-gradient(46% 38% at 92% 16%, rgba(124,140,255,0.09) 0%, transparent 70%),' +
          'radial-gradient(55% 45% at 50% 105%, rgba(61,220,200,0.06) 0%, transparent 70%),' +
          'radial-gradient(30% 30% at 75% 65%, rgba(124,140,255,0.05) 0%, transparent 70%)',
      }}
    />
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ClientProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative', background: 'var(--bg-base)' }}>
        <GlowBackdrop />
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{ minHeight: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ClientProvider>
  );
}
