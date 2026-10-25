import type { Metadata } from 'next';
import ChannelPage from '@/components/marketing/ChannelPage';
import { ReportMock, ScreenshotFrame } from '@/components/marketing/mocks';

export const metadata: Metadata = { title: 'Video & TVC Analysis' };

export default function VideoPage() {
  return (
    <ChannelPage
      eyebrow="Video & TVC analysis"
      title="Scene-by-scene critique for film that costs real money."
      highlight="film that costs real money."
      sub="From animatic to final cut — Concave watches the film, maps attention and branding moments scene-by-scene, and scores the cut on all six drivers before you commit to the edit (or the airtime)."
      primaryCta={{ label: 'Analyze a cut', href: '/login' }}
      heroVisual={
        <ScreenshotFrame>
          <ReportMock />
        </ScreenshotFrame>
      }
      pairs={[
        {
          challenge: 'The brand reveal lands too late.',
          solution: 'Brand-entry timing flagged with timestamp.',
        },
        {
          challenge: 'The story sags mid-film.',
          solution: 'Scene-level pacing verdicts show where interest drops.',
        },
        {
          challenge: 'The cutdowns lose the idea.',
          solution: '15s/6s cutdowns scored against the 30s for idea retention.',
        },
        {
          challenge: "We won't know if the animatic works until it's shot.",
          solution: 'Score the animatic first — fix story before production, not after.',
        },
      ]}
      emphasizedDrivers={['Attention', 'Emotional Engagement', 'Branding']}
      spotlight={{
        title: 'Six drivers, tuned for film.',
        note: 'Same framework as every Concave analysis — so video scores are comparable with the rest of the campaign.',
      }}
      faq={[
        {
          q: 'What stages can it score?',
          a: 'Animatic, offline, final — earlier is cheaper.',
        },
        {
          q: 'Are there length limits?',
          a: 'Up to standard TVC and online lengths; longform support is on the roadmap.',
        },
        {
          q: 'Does it transcribe the audio?',
          a: 'Yes — VO and supers are read and factored into message scoring.',
        },
      ]}
    />
  );
}
