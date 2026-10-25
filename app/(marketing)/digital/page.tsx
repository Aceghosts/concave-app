import type { Metadata } from 'next';
import ChannelPage from '@/components/marketing/ChannelPage';
import { KpiDetailMock, ScreenshotFrame } from '@/components/marketing/mocks';

export const metadata: Metadata = { title: 'Digital Ads & Banner Analysis' };

export default function DigitalPage() {
  return (
    <ChannelPage
      eyebrow="Digital ads & banner analysis"
      title="Every banner, argued for."
      highlight="argued for."
      sub="Display sets scored for instant clarity, brand presence, CTA strength and message hierarchy — across all sizes, before trafficking."
      primaryCta={{ label: 'Analyze a display set', href: '/login' }}
      heroVisual={
        <ScreenshotFrame>
          <KpiDetailMock />
        </ScreenshotFrame>
      }
      pairs={[
        {
          challenge: 'The headline is illegible at actual size.',
          solution: 'Legibility judged at rendered size, not the design file.',
        },
        {
          challenge: 'The brand goes missing in the 300×250.',
          solution: 'Brand presence checked per size variant.',
        },
        {
          challenge: 'The CTA is buried.',
          solution: 'CTA attention and wording scored explicitly.',
        },
        {
          challenge: "The set doesn't hold together.",
          solution: 'Cross-size coherence check.',
        },
      ]}
      emphasizedDrivers={['Processing Ease', 'Persuasion']}
      spotlight={{
        title: 'Six drivers, tuned for display.',
        note: 'Same framework as every Concave analysis — so display scores are comparable with the rest of the campaign.',
      }}
      faq={[
        {
          q: 'Does it cover all IAB sizes?',
          a: 'Yes — each size scored separately.',
        },
        {
          q: 'What about HTML5 banners?',
          a: 'Export frames or screen captures for now; native HTML5 rendering is on the roadmap.',
        },
        {
          q: 'Can it check the landing-page match?',
          a: 'Add the landing page as an asset and Concave checks message continuity.',
        },
      ]}
    />
  );
}
