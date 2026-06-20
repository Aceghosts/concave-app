'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FlaskConical, History,
  Users, Shield, ChevronLeft, ChevronRight, Plus, Sun, Moon, LogOut,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ClientDropdown from '@/components/ClientDropdown';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New Analysis', href: '/analyze', icon: FlaskConical },
  { label: 'History', href: '/history', icon: History },
];
const SETTINGS = [
  { label: 'Clients', href: '/settings/clients', icon: Users },
  { label: 'Admin', href: '/settings/admin', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const W = collapsed ? 72 : 256;

  function NavItem({ item }: { item: typeof NAV[0] }) {
    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    const Icon = item.icon;
    return (
      <motion.button
        onClick={() => router.push(item.href)}
        whileHover={{ x: collapsed ? 0 : 4 }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: collapsed ? '11px 0' : '11px 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          background: active ? 'rgba(62,180,137,0.15)' : 'transparent',
          color: active ? '#fff' : 'rgba(255,255,255,0.50)',
          fontFamily: 'var(--font-poppins)',
          fontSize: 14,
          fontWeight: active ? 600 : 400,
          marginBottom: 2,
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {active && (
          <motion.div
            layoutId="nav-active"
            style={{
              position: 'absolute', left: 0,
              top: '50%', transform: 'translateY(-50%)',
              width: 3, height: 22,
              background: '#3EB489',
              borderRadius: 99,
            }}
          />
        )}
        <Icon size={18} strokeWidth={1.75} style={{ flexShrink: 0 }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 55%, #1a1f2e 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '24px 0' : '24px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        marginBottom: 16,
      }}>
        <span className="shimmer-text font-bebas" style={{
          fontSize: collapsed ? 22 : 26,
          letterSpacing: collapsed ? 1 : 2,
          lineHeight: 1,
        }}>
          {collapsed ? 'C' : 'CONCAVE'}
        </span>
      </div>

      {/* Client selector */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: '0 14px', marginBottom: 20 }}
          >
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Active Client</p>
            <ClientDropdown />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '0 10px' : '0 12px', overflowY: 'auto' }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 4px', marginBottom: 6 }}>
              Menu
            </motion.p>
          )}
        </AnimatePresence>
        {NAV.map(item => <NavItem key={item.href} item={item} />)}

        {/* Settings */}
        <div style={{ marginTop: 20 }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 4px', marginBottom: 6 }}>
                Settings
              </motion.p>
            )}
          </AnimatePresence>
          {SETTINGS.map(item => <NavItem key={item.href} item={item} />)}
        </div>
      </nav>

      {/* Bottom: Meta status + theme + collapse */}
      <div style={{ padding: collapsed ? '12px 10px' : '12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Meta status */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', marginBottom: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
              }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.20)', flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500, margin: 0 }}>Meta Not Connected</p>
                <p style={{ fontFamily: 'var(--font-poppins)', fontSize: 10, color: 'rgba(255,255,255,0.22)', margin: 0 }}>Add a client to connect</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme toggle + collapse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: collapsed ? 'center' : 'space-between' }}>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </motion.button>

          {!collapsed && (
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
              title="Sign out"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.40)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <LogOut size={14} />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.40)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
