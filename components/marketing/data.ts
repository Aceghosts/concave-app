import type { LucideIcon } from 'lucide-react';
import {
  Eye,
  Fingerprint,
  Gauge,
  Crosshair,
  HeartPulse,
  Megaphone,
} from 'lucide-react';

export interface Driver {
  name: string;
  definition: string;
  icon: LucideIcon;
}

/** The six effectiveness drivers (spec §5.2 sub-KPI table, one-line form). */
export const DRIVERS: Driver[] = [
  { name: 'Attention', icon: Eye, definition: 'Visual hierarchy, hook strength, key-message prominence, focal clarity.' },
  { name: 'Branding', icon: Fingerprint, definition: 'Brand presence, brand-entry timing, distinctive-asset use, product visibility.' },
  { name: 'Processing Ease', icon: Gauge, definition: 'Visual simplicity, legibility, reading effort, word familiarity.' },
  { name: 'Strategic Fit', icon: Crosshair, definition: 'Brief-objective match, audience relevance, proposition clarity, mandatory compliance.' },
  { name: 'Emotional Engagement', icon: HeartPulse, definition: 'Emotional arc, sentiment valence, activation energy, human interest.' },
  { name: 'Persuasion', icon: Megaphone, definition: 'CTA strength, benefit clarity, reason-to-believe, urgency / next step.' },
];

export interface NavChild {
  label: string;
  href: string;
  badge?: string;
  description?: string;
}

export const PRODUCT_NAV: NavChild[] = [
  { label: 'Campaign & Brief Analysis', href: '/campaign-analysis', badge: 'Flagship' },
  { label: 'Social', href: '/social' },
  { label: 'Digital', href: '/digital' },
  { label: 'Video', href: '/video' },
  { label: 'Platform', href: '/platform' },
];

export const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Campaign & Brief Analysis', href: '/campaign-analysis' },
      { label: 'Social', href: '/social' },
      { label: 'Digital', href: '/digital' },
      { label: 'Video', href: '/video' },
      { label: 'Platform', href: '/platform' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '#' },
      { label: 'API', href: '/api-partners' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Imprint', href: '#' },
    ],
  },
];
