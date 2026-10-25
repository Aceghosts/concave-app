import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import NavBar from '@/components/marketing/NavBar';
import Footer from '@/components/marketing/Footer';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Concave — Expert AI critique for agencies',
    template: '%s — Concave',
  },
  description:
    'Concave reads your brief, scores every asset on six effectiveness drivers, and hands you a client-ready report in minutes.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-surface="marketing"
      className={`${grotesk.variable} ${inter.variable} relative flex min-h-screen flex-col`}
    >
      {/* Fixed ambient color field — gives the glass something to blur */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(42% 34% at 10% 6%, rgba(61,220,200,0.07) 0%, transparent 70%),' +
            'radial-gradient(46% 38% at 92% 16%, rgba(124,140,255,0.08) 0%, transparent 70%),' +
            'radial-gradient(55% 45% at 50% 105%, rgba(61,220,200,0.05) 0%, transparent 70%),' +
            'radial-gradient(30% 30% at 75% 65%, rgba(124,140,255,0.05) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
