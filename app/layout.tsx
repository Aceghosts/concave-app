import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

const akiraExpanded = localFont({
  src: '../public/fonts/AkiraExpanded.otf',
  variable: '--font-bebas',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Concave — Campaign Analysis Engine',
  description: 'AI-powered campaign effectiveness scoring for agencies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${akiraExpanded.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
