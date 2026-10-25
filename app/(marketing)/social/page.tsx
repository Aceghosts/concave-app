import type { Metadata } from 'next';
import { CalendarCheck, Coins, PenTool } from 'lucide-react';
import ChannelPage from '@/components/marketing/ChannelPage';
import { AbCompareMock, ScreenshotFrame } from '@/components/marketing/mocks';

export const metadata: Metadata = { title: 'Social Media Analysis' };

export default function SocialPage() {
  return (
    <ChannelPage
      eyebrow="Social media analysis"
      title="Critique the hook before you buy the reach."
      highlight="before you buy the reach."
      sub="Concave scores social creative — statics, carousels, vertical video — on the six drivers plus the platform realities: scroll-stopping power, first-second hook, sound-off legibility, format mandatories."
      primaryCta={{ label: 'Analyze social creative', href: '/login' }}
      heroVisual={
        <ScreenshotFrame>
          <AbCompareMock />
        </ScreenshotFrame>
      }
      pairs={[
        {
          challenge: 'Half the videos die in the first second.',
          solution:
            'Hook critique scores the opening frame and first line against what your past winners did.',
        },
        {
          challenge: 'It looks great with sound on. Nobody has sound on.',
          solution:
            'Sound-off pass: supers, captions and visual storytelling judged on their own.',
        },
        {
          challenge: 'The same cut goes to every platform.',
          solution:
            'Format-fit check per placement — aspect, safe zones, duration, platform conventions.',
        },
        {
          challenge: 'Branding shows up at second 28.',
          solution:
            'Brand-presence timing flagged scene-by-scene, with the moment it first lands.',
        },
      ]}
      emphasizedDrivers={['Attention', 'Emotional Engagement']}
      spotlight={{
        title: 'Six drivers, tuned for the feed.',
        note: 'Same framework as every Concave analysis — so social scores are comparable with the rest of the campaign.',
      }}
      abLoop={{
        title: 'The daily loop: compare, fix, re-run.',
        body: 'Put two cuts side-by-side and see per-KPI deltas — which thumbnail, which first line, which CTA. Keep the evidence trail for the media plan.',
      }}
      personas={[
        {
          icon: CalendarCheck,
          role: 'Social teams',
          body: 'Volume triage: find the weak posts before the calendar ships.',
        },
        {
          icon: Coins,
          role: 'Media planners',
          body: 'Prioritize spend toward creative that holds up.',
        },
        {
          icon: PenTool,
          role: 'Creative teams',
          body: "Specific first-frame feedback, not 'make it pop'.",
        },
      ]}
      faq={[
        {
          q: 'Does it handle vertical video?',
          a: 'Yes — Concave watches the video, scores scene-by-scene, and flags the hook, pacing and brand-entry moments.',
        },
        {
          q: 'Can it predict engagement rate?',
          a: "No tool honestly can from creative alone. Concave tells you what's weak and why; your calibration data tells you how similar work actually performed.",
        },
        {
          q: 'How many assets per batch?',
          a: "Upload a content calendar's worth; each asset is scored individually and as part of the set.",
        },
        {
          q: 'Which platforms?',
          a: 'The critique adapts to the placement you declare — feed, stories, reels, shorts — with the format mandatories of each.',
        },
      ]}
    />
  );
}
