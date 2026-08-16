import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GOALS = ['Brand Awareness', 'Lead Generation', 'Sales Conversion', 'App Downloads', 'Community Growth', 'Event Promotion'];
const PLATFORMS = ['Meta', 'Instagram', 'TikTok', 'YouTube', 'Snapchat', 'LinkedIn', 'Twitter/X'];
const TONES = ['Bold & Energetic', 'Warm & Emotional', 'Minimalist', 'Humorous', 'Premium & Aspirational', 'Educational', 'Urgent'];

// Extracts campaign form fields from uploaded-file markdown
export async function POST(req: NextRequest) {
  try {
    const { extractedMd } = await req.json();
    if (!extractedMd) return NextResponse.json({ error: 'extractedMd required' }, { status: 400 });

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Extract campaign details from this document. Return ONLY a JSON object, no other text:
{
  "campaignName": string | null,   // campaign/project name if stated
  "brief": string | null,          // 2-4 sentence summary of the campaign concept and key message, written from the document
  "goal": string | null,           // closest match from: ${GOALS.join(', ')} — or null
  "audience": string | null,       // target audience if stated, e.g. "Women 25-40, UAE"
  "platforms": string[],           // matches from: ${PLATFORMS.join(', ')} — empty array if none stated
  "budget": string | null,         // budget if stated
  "timeline": string | null,       // timeline/duration if stated
  "tone": string | null            // closest match from: ${TONES.join(', ')} — or null
}
Use null for anything not clearly present in the document. Do not invent.

DOCUMENT:
${String(extractedMd).slice(0, 30000)}`,
      }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'No JSON in response' }, { status: 500 });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Prefill failed' }, { status: 500 });
  }
}
