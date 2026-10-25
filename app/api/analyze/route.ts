import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { CHANNELS, DEFAULT_CHANNEL, LENS_KEYS, buildChannelAddendum, isChannelId } from '@/lib/channels';

export const maxDuration = 300;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Concave — the most rigorous campaign analysis intelligence used by elite creative agencies in the Middle East. You combine three disciplines into one output: deep advertising research, behavioral science, and creative strategy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCH METHODOLOGY (from /deep-research + /research-deep)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You operate as a deep research agent, not a chatbot. Every claim must be:
- EVIDENCE-BASED: Cite research, known benchmarks, case studies, or established advertising science — not opinions
- SPECIFIC: Reference actual details from THIS campaign. No sentence should be copy-pasteable to another campaign
- CALIBRATED: Flag uncertainty where it exists. If you cannot verify something, say "likely" or "unclear from brief"
- LAYERED: Go multiple levels deep. Don't stop at the surface observation — explain WHY, then explain WHY that matters
- EXHAUSTIVE: Cover every dimension. Missing a section is worse than a weak section

Research depth requirements per insight:
1. What is happening (observable fact from brief/file)
2. Why it happens (behavioral/creative mechanism)
3. What the data says (benchmark, research finding, industry pattern)
4. What the consequence is (impact on campaign performance)
5. What should be done (specific, actionable fix)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MARKETING PSYCHOLOGY FRAMEWORK (from /marketing-psychology)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You have deep expertise in 70+ behavioral science mental models. Apply the most relevant ones to analyze every campaign. Do not just name them — show how they apply or are violated in THIS specific campaign.

FOUNDATIONAL MODELS TO APPLY:
• Loss Aversion — People feel losses 2x more intensely than gains. Analyze whether the campaign frames benefits as gains or prevents losses. Loss framing consistently outperforms gain framing in ad effectiveness research.
• Anchoring Effect — The first number/price/claim seen sets expectations for everything that follows. Evaluate the campaign's anchor points and opening frame.
• Social Proof — People follow visible behaviors of others. Assess whether the creative leverages testimonials, crowd behavior, popularity signals, or expert endorsement.
• Scarcity Principle — Limited availability (time, quantity, access) increases perceived value. Real scarcity multiplies urgency; fake urgency destroys trust.
• Framing Effect — The same fact with different framing produces radically different responses. "95% success rate" vs "1 in 20 fails." Audit the campaign's frame choices.
• Reciprocity — When brands give value first, audiences feel compelled to reciprocate. Evaluate whether the campaign gives before it asks.
• AIDA Model (Attention → Interest → Desire → Action) — Every ad must move through all 4 stages. Diagnose where this campaign succeeds and stalls.
• Fogg Behavior Model (B = MAT: Motivation × Ability × Trigger) — Behavior happens when motivation, ability, and a trigger converge simultaneously. Weak CTAs fail because they lack one element.
• Hick's Law — More choices = longer decision time = lower conversion. Evaluate message complexity and option overload.
• Contrast Effect — Objects are judged relative to what surrounds them. Assess whether the creative uses visual/emotional contrast effectively.
• Endowment Effect — People value what they already "own." Evaluate whether the campaign uses free trials, samples, or "save your progress" mechanics.
• Mere Exposure Effect — Repeated exposure increases liking, even without conscious memory of prior exposure. Assess whether the campaign is built for frequency or single-impression.
• Zeigarnik Effect — Incomplete tasks stay in memory longer than completed ones. Evaluate whether the creative uses open loops, cliffhangers, or curiosity gaps.
• Pratfall Effect — A small flaw or vulnerability can increase likability and trust. Assess whether the brand voice has authentic imperfection or feels too polished.
• Decoy Effect — Adding a dominated option makes the target option look like the obvious choice. Relevant for campaigns promoting tiered offers.
• Status Quo Bias — People default to inaction. Every campaign must overcome the activation energy of doing nothing. Evaluate friction reduction.
• Commitment & Consistency (Cialdini) — Small early commitments increase likelihood of larger later compliance. Evaluate the campaign's commitment ladder.
• Unity Principle (Cialdini) — Shared identity ("we are the same kind of person") is more persuasive than authority or social proof. Assess identity alignment with the target audience.
• Curiosity Gap — The tension between what we know and what we want to know drives behavior. Evaluate whether the creative creates an irresistible information gap.
• Peak-End Rule — People judge experiences by their peak moment and their ending, not the average. Evaluate the campaign's most intense moment and how it ends.
• Cultural Congruence (MENA-specific) — In Gulf markets, campaigns must honor collective identity, family values, aspiration tied to heritage, and avoid anything that creates cognitive dissonance with local norms. Analyze cultural fit in depth.

BUYER PSYCHOLOGY TRIGGERS TO DIAGNOSE:
• What emotional state does this campaign create? (Fear, excitement, belonging, aspiration, nostalgia?)
• What cognitive shortcut does it activate? (Trust, familiarity, desire, urgency?)
• Where does it hit on Maslow's hierarchy? (Safety, belonging, esteem, self-actualization?)
• What objection does it fail to preemptively address?
• What is the psychological cost of clicking vs. not clicking?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE 6 DRIVERS — ANALYTICAL LENS FOR EACH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ATTENTION — Apply: Contrast Effect, Novelty Bias, Mere Exposure, Zeigarnik Effect
   Measure: First-frame impact, thumb-stopping quality, visual contrast, motion, audio hook, pattern interruption
   Research lens: Nielsen attention research shows <2s to capture or lose; brain prioritizes movement, faces, high contrast, unexpected stimuli

2. BRANDING — Apply: Mere Exposure, Consistency Principle, Unity Principle
   Measure: Logo timing, brand voice consistency, visual identity, sonic branding, brand recall potential
   Research lens: Byron Sharp's "How Brands Grow" — distinctive assets (color, logo, character) must appear consistently; delayed branding kills recall

3. PROCESSING EASE — Apply: Hick's Law, Cognitive Load Theory, Chunking
   Measure: Message clarity, cognitive load, text density, visual hierarchy, information architecture
   Research lens: Every additional element increases cognitive load; ads that score low on processing ease see 31% lower message recall (Kantar Millward Brown)

4. STRATEGIC FIT — Apply: Jobs-to-Be-Done, Second-Order Thinking, Platform Native Behavior
   Measure: Objective-creative alignment, platform nativity, audience relevance, format appropriateness, funnel stage fit
   Research lens: WARC effectiveness data — misalignment between creative and campaign objective is the #1 cause of campaign failure

5. EMOTIONAL ENGAGEMENT — Apply: Peak-End Rule, Cultural Congruence, Storytelling Structures, Autonomy Bias
   Measure: Emotional arc, cultural resonance, authenticity, storytelling quality, human connection
   Research lens: Institute of Practitioners in Advertising (IPA) — campaigns with pure emotional content outperform rational campaigns 2:1 on profitability metrics

6. PERSUASION — Apply: AIDA, Fogg Model, Loss Aversion, Scarcity, Reciprocity, Commitment
   Measure: CTA strength, offer clarity, urgency mechanics, social proof, conversion path length
   Research lens: Cialdini's influence principles; every CTA must have motivation (why act), ability (easy to act), and trigger (do it now)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUB-KPI DECOMPOSITION (score every one, 0-100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each driver decomposes into named sub-KPIs. Score EVERY sub-KPI listed for its driver, 0-100 integer.
Status thresholds: 70-100 = green, 40-69 = amber, 0-39 = red.
Each sub-KPI needs a one-line plain-English verdict + the specific observable evidence.
If a sub-KPI cannot be assessed from the materials provided (e.g. visual KPIs with no visual supplied), score it from what the brief implies and say so in the evidence field.

ATTENTION sub-KPIs:
• Visual Hierarchy — is there a clear 1-2-3 order the eye follows? Does the most important element win?
• Key Message Attention — does the core message sit where attention naturally lands?
• First-Impression Hook — thumb-stopping power in the first glance / first 3 seconds
• Focal Competition — how many elements compete for attention; clutter penalty

BRANDING sub-KPIs:
• Brand Attention — logo/brand share of visual attention: size, placement, contrast
• Product Attention — how much attention the product itself captures
• Brand Color Coverage — presence of distinctive brand colors/assets across the creative
• Earliest Brand Moment — how early the brand appears (first 3s for video, instantly visible for static)

PROCESSING EASE sub-KPIs:
• Visual Simplicity — element count, layout complexity, negative space
• Legibility — font size/contrast/placement at actual viewing size (mobile thumbnail!)
• Reading Time — total words vs. realistic view time on the platform (~3 words/sec; feed views are 1-3s)
• Message Clarity — can a distracted viewer state what this ad wants in one sentence?

STRATEGIC FIT sub-KPIs (score against the BRIEF — this is context Brainsuite doesn't have; use it hard):
• Goal Fit — does the creative mechanically deliver on the stated campaign goal?
• Audience Fit — mindset, culture, aspirations of the stated target audience
• Platform Fit — native to each stated platform's format and viewing behavior
• Tone Fit — matches the stated tone/mood and brand voice

EMOTIONAL ENGAGEMENT sub-KPIs:
• Visual Activation — arousal/energy of the imagery (Russell circumplex: activation axis)
• Text Activation — energy and charge of the copy
• Visual Sentiment — valence of the imagery (positive/negative and whether that's right for the goal)
• Text Sentiment — valence of the copy

PERSUASION sub-KPIs:
• CTA Attention — is the call-to-action visible, prominent, findable?
• Offer Clarity — is what-you-get and why-now unmistakable?
• Fit to Needs (Visual) — does the imagery connect to a real need/desire of the audience?
• Fit to Needs (Text) — does the copy speak to a real need/desire?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING CALIBRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9.0–10: World-class — benchmarks like Nike "You Can't Stop Us," Apple "1984," Old Spice "Man Your Man Could Smell Like"
8.0–8.9: Strong — above category average, would outperform most competitors in market
7.0–7.9: Solid — functional, on-brief, but missing the creative leap or psychological precision to truly excel
6.0–6.9: Average — meets minimum bar but loses to well-resourced competition
5.0–5.9: Below average — visible flaws that will hurt performance; measurable opportunity cost
Below 5: Critical problems — likely to underperform significantly; needs fundamental rework

RULES:
1. Never write a sentence that applies to any campaign — every insight must reference specific details from THIS campaign
2. Apply at least 3 psychological models per driver — named explicitly with how they apply
3. Cite benchmarks or research findings at least once per driver section
4. If a file/image is provided, comment on specific visible elements (copy, color, hierarchy, composition, production quality)
5. Be honest about weaknesses — agencies hire Concave to hear the truth, not feel good
6. Flag uncertainty: use "likely," "unclear from brief," or "would need to see the full creative to confirm" where appropriate
7. Go deep on MENA/Gulf cultural dynamics when relevant — this is a critical dimension most global tools miss`;

const SUB_KPI_SCHEMA = {
  type: 'array',
  description: 'The named sub-KPIs for this driver (see system prompt for exact list per driver). Score each independently.',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Exact sub-KPI name from the system prompt list for this driver' },
      score: { type: 'number', description: '0-100 integer. Calibrated: 70+ green (strong), 40-69 amber (needs work), <40 red (critical)' },
      status: { type: 'string', enum: ['green', 'amber', 'red'] },
      verdict: { type: 'string', description: 'One plain-English sentence stating the finding, e.g. "The brand logo gets a low share of attention — under 2% of the frame, bottom-left corner."' },
      evidence: { type: 'string', description: 'The specific observable detail from the creative/brief that justifies this score' },
    },
    required: ['name', 'score', 'status', 'verdict', 'evidence'],
  },
};

const DRIVER_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number', description: 'Score 0-10, one decimal. Be calibrated and honest.' },
    sub_kpis: SUB_KPI_SCHEMA,
    summary: { type: 'string', description: 'One sharp sentence — the single most important truth about this driver for this campaign.' },
    deep_analysis: { type: 'string', description: 'Comprehensive 5-8 sentence analysis. Reference specific details from the brief, files, and answers. Explain the WHY behind every observation. Include relevant research or industry knowledge where applicable.' },
    what_works: {
      type: 'array', items: { type: 'string' },
      description: '3-5 specific strengths. Each must be a full sentence referencing something concrete from this campaign.',
    },
    what_doesnt: {
      type: 'array', items: { type: 'string' },
      description: '3-5 specific weaknesses. Be direct. Each must reference something concrete.',
    },
    recommendations: {
      type: 'array', items: {
        type: 'object',
        properties: {
          priority: { type: 'string', enum: ['Critical', 'High', 'Medium'] },
          action: { type: 'string', description: 'Specific, actionable recommendation' },
          rationale: { type: 'string', description: 'Why this matters and what impact it will have' },
          effort: { type: 'string', enum: ['Low', 'Medium', 'High'] },
        },
        required: ['priority', 'action', 'rationale', 'effort'],
      },
      description: '3-4 recommendations, ordered by priority. Be specific enough that a creative team can act on it tomorrow.',
    },
    benchmark_context: { type: 'string', description: 'How does this driver compare to best-in-class campaigns in this category/platform? What does top quartile look like and how far is this campaign from it?' },
  },
  required: ['score', 'sub_kpis', 'summary', 'deep_analysis', 'what_works', 'what_doesnt', 'recommendations', 'benchmark_context'],
};

const SCHEMA = {
  type: 'object' as const,
  properties: {
    overall_score: { type: 'number', description: 'Weighted average. Weight: Attention 20%, Strategic Fit 20%, Emotional Engagement 18%, Persuasion 17%, Branding 13%, Processing Ease 12%.' },
    grade: { type: 'string', enum: ['Exceptional', 'Strong', 'Solid', 'Needs Work', 'Critical Issues'] },
    executive_summary: { type: 'string', description: 'A hard-hitting 4-6 sentence executive summary. What is this campaign trying to do, how well does the creative deliver on that, what are the 2-3 things that will make or break it, and what is the overall prognosis? Be specific to this campaign.' },
    verdict: { type: 'string', description: '1-2 sentence bottom-line verdict. The thing a CEO needs to hear.' },
    top_recommendations: {
      type: 'array', items: { type: 'string' },
      description: 'Top 3 highest-impact recommendations in order of priority. Specific and actionable.',
    },
    creative_critique: {
      type: 'object',
      description: 'In-depth critique of the creative execution itself',
      properties: {
        concept_strength: { type: 'string', description: '3-4 sentences on the core creative concept — is it ownable, is it fresh, does it communicate the right thing?' },
        execution_quality: { type: 'string', description: '3-4 sentences on the execution quality based on the brief/files provided' },
        copy_analysis: { type: 'string', description: '3-4 sentences analyzing the copy strategy — headline, body, CTA. What is the copy doing well or failing at?' },
        visual_analysis: { type: 'string', description: '3-4 sentences on visual direction, design choices, and production values if discernible from files or description' },
        format_analysis: { type: 'string', description: '2-3 sentences on whether the format choice (Reel, Story, static, etc.) is right for the objective and audience' },
      },
      required: ['concept_strength', 'execution_quality', 'copy_analysis', 'visual_analysis', 'format_analysis'],
    },
    audience_analysis: {
      type: 'object',
      properties: {
        audience_fit: { type: 'string', description: '3-4 sentences on how well the creative matches the target audience — their mindset, motivations, cultural context, and platform behavior' },
        cultural_relevance: { type: 'string', description: '3-4 sentences on cultural resonance, particularly for MENA/Gulf market if applicable. Does it feel local and authentic?' },
        psychographic_alignment: { type: 'string', description: '2-3 sentences on whether the emotional and aspirational triggers in the creative match what this audience responds to' },
      },
      required: ['audience_fit', 'cultural_relevance', 'psychographic_alignment'],
    },
    platform_analysis: {
      type: 'array',
      description: 'One detailed entry per platform this campaign targets',
      items: {
        type: 'object',
        properties: {
          platform: { type: 'string' },
          fit_score: { type: 'number', description: 'How well this creative fits this specific platform, 0-10' },
          algorithm_considerations: { type: 'string', description: '2-3 sentences on how this platform\'s algorithm will treat this creative — what signals does it send, what will help or hurt distribution?' },
          format_recommendations: { type: 'string', description: 'Specific format, duration, and technical recommendations for this platform' },
          expected_performance: { type: 'string', description: 'Honest assessment of expected performance on this platform based on the creative quality and platform dynamics' },
        },
        required: ['platform', 'fit_score', 'algorithm_considerations', 'format_recommendations', 'expected_performance'],
      },
    },
    risk_assessment: {
      type: 'object',
      properties: {
        primary_risks: {
          type: 'array', items: { type: 'string' },
          description: '3-4 specific risks that could cause this campaign to underperform',
        },
        mitigation_strategies: {
          type: 'array', items: { type: 'string' },
          description: 'Corresponding mitigation for each risk',
        },
        confidence_level: { type: 'string', enum: ['High', 'Medium', 'Low'], description: 'Overall confidence in campaign success' },
        confidence_rationale: { type: 'string', description: '2-3 sentences explaining the confidence level' },
      },
      required: ['primary_risks', 'mitigation_strategies', 'confidence_level', 'confidence_rationale'],
    },
    drivers: {
      type: 'object',
      properties: {
        attention:            { ...DRIVER_SCHEMA },
        branding:             { ...DRIVER_SCHEMA },
        processing_ease:      { ...DRIVER_SCHEMA },
        strategic_fit:        { ...DRIVER_SCHEMA },
        emotional_engagement: { ...DRIVER_SCHEMA },
        persuasion:           { ...DRIVER_SCHEMA },
      },
      required: ['attention', 'branding', 'processing_ease', 'strategic_fit', 'emotional_engagement', 'persuasion'],
    },
    comparable_campaigns: {
      type: 'array',
      description: '2-3 real comparable campaigns genuinely relevant to this campaign\'s industry, platform, goal, and audience.',
      items: {
        type: 'object',
        properties: {
          name:      { type: 'string' },
          brand:     { type: 'string' },
          platform:  { type: 'string' },
          year:      { type: 'string' },
          concept:   { type: 'string', description: '2-3 sentences on what made this campaign work or fail' },
          metrics:   { type: 'object', properties: { views: { type: 'string' }, engagement: { type: 'string' }, sales_impact: { type: 'string' }, earned_media: { type: 'string' } } },
          lesson:    { type: 'string', description: 'Specific lesson that applies to this campaign' },
          relevance: { type: 'string', description: 'Why this campaign is comparable' },
        },
        required: ['name', 'brand', 'platform', 'year', 'concept', 'metrics', 'lesson', 'relevance'],
      },
    },
    industry_benchmarks: {
      type: 'object',
      properties: {
        context: { type: 'string' },
        platform_benchmarks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform:       { type: 'string' },
              industry:       { type: 'string' },
              avg_ctr:        { type: 'string' },
              avg_cpm:        { type: 'string' },
              avg_engagement: { type: 'string' },
              avg_video_view: { type: 'string' },
              what_it_means:  { type: 'string' },
            },
            required: ['platform', 'industry', 'avg_ctr', 'avg_cpm', 'avg_engagement', 'what_it_means'],
          },
        },
        overall_insight: { type: 'string' },
      },
      required: ['context', 'platform_benchmarks', 'overall_insight'],
    },
  },
  required: ['overall_score', 'grade', 'executive_summary', 'verdict', 'top_recommendations', 'creative_critique', 'audience_analysis', 'platform_analysis', 'risk_assessment', 'drivers', 'comparable_campaigns', 'industry_benchmarks'],
};

// script_storyboard variant: same report shape, but `drivers` holds the 3 meta-lenses
// (Attention / Recognition / Motivation) instead of the 6 drivers.
const LENS_SCHEMA = {
  ...SCHEMA,
  properties: {
    ...SCHEMA.properties,
    overall_score: { type: 'number', description: 'Average of the 3 lens scores (Attention, Recognition, Motivation), 0-10.' },
    drivers: {
      type: 'object',
      description: 'The 3 meta-lenses for script/storyboard evaluation — NOT the 6 drivers.',
      properties: Object.fromEntries(LENS_KEYS.map(k => [k, { ...DRIVER_SCHEMA }])),
      required: [...LENS_KEYS],
    },
  },
};

const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/mpeg'];

type PastCampaign = {
  name: string;
  channel: string | null;
  outcome_metrics: Record<string, unknown>;
  creative_traits: Record<string, unknown>;
  created_at: string;
};

/**
 * Phase D calibration: fetch this client's past campaigns (newest 5, same-channel
 * preferred). Any failure — no table, no key, no rows — returns [] and the
 * analysis proceeds exactly as without calibration. Never throws.
 */
async function fetchPastCampaigns(clientId: string, channelId: string): Promise<PastCampaign[]> {
  try {
    const { supabaseServer } = await import('@/lib/supabase-server');
    const { data, error } = await supabaseServer
      .from('past_campaigns')
      .select('name, channel, outcome_metrics, creative_traits, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(25);
    if (error || !data) return [];
    const rows = data as PastCampaign[];
    const sameChannel = rows.filter(r => r.channel === channelId);
    const rest = rows.filter(r => r.channel !== channelId);
    return [...sameChannel, ...rest].slice(0, 5);
  } catch {
    return [];
  }
}

function buildCalibrationBlock(campaigns: PastCampaign[]): string {
  const entries = campaigns.map((c, i) => {
    const metrics = Object.entries(c.outcome_metrics ?? {}).map(([k, v]) => `${k}: ${v}`).join(', ') || 'no metrics recorded';
    const traits = Object.entries(c.creative_traits ?? {}).map(([k, v]) => `${k}: ${v}`).join(', ');
    return `${i + 1}. "${c.name}"${c.channel ? ` [${c.channel}]` : ''} — outcomes: ${metrics}${traits ? ` — creative traits: ${traits}` : ''}`;
  }).join('\n');

  return `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALIBRATION CONTEXT — THIS CLIENT'S REAL PAST CAMPAIGNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following are this client's actual past campaigns with their REAL recorded outcome metrics:
${entries}

Use these as client-specific comparables: identify which past campaigns this new creative most resembles, and calibrate expectations against the client's own track record ("this client's winners averaged X on Y", "this resembles their strong/weak cluster because…"). Reference them ONLY where genuinely relevant to a specific insight — do not force a calibration mention into every section. HONESTY RULE: use ONLY the metrics listed above, verbatim — never extrapolate, average beyond the data shown, or invent any metric for these campaigns. Where the data is too thin to support a comparison, say so.`;
}

async function analyzeVideoWithGemini(fileUri: string, mimeType: string, campaignContext: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const result = await model.generateContent([
    {
      fileData: { mimeType, fileUri },
    },
    {
      text: `You are a senior creative director analyzing a video ad campaign. Watch this video carefully and provide an exhaustive creative analysis.

Campaign context: ${campaignContext}

Analyze and describe in detail:
1. OPENING HOOK (first 3 seconds): Exactly what happens, what is shown, what text/audio appears
2. SCENE-BY-SCENE BREAKDOWN: Every scene, what's on screen, duration, transitions
3. VISUALS: Color palette, typography, cinematography style, graphic elements, production quality
4. AUDIO: Music style/genre/mood, voiceover (transcribe exactly), sound effects, audio pacing
5. TEXT OVERLAYS: Every piece of text shown, when it appears, styling
6. TALENT/PEOPLE: Who appears, how they're portrayed, their actions and expressions
7. BRAND ELEMENTS: Logo appearances (when/where), brand colors used, brand name mentions
8. CTA: What the call-to-action is, when it appears, how it's delivered
9. PACING & EDITING: Cut frequency, rhythm, energy level, overall pace
10. EMOTIONAL JOURNEY: What emotions does each section evoke, overall emotional arc
11. PLATFORM FIT OBSERVATIONS: Does this feel native to its intended platform?
12. STANDOUT MOMENTS: The single most impactful moment and why
13. WEAKNESSES VISIBLE: Any production issues, unclear messaging, missed opportunities you observe

Be brutally specific. Reference exact timestamps. This analysis will be the foundation for a full campaign effectiveness scoring.`,
    },
  ]);

  return result.response.text();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { intake, clarification, fileBase64, fileMediaType, fileName, geminiFileUri, geminiMimeType, extractedMd } = body;

    // Analysis app (channel). Absent → default (exact current behavior). Unknown → 400.
    const channelId = body.channel ?? intake?.channel ?? DEFAULT_CHANNEL;
    if (!isChannelId(channelId)) {
      return NextResponse.json({ error: `Unknown channel "${channelId}". Valid: ${Object.keys(CHANNELS).join(', ')}` }, { status: 400 });
    }
    const channel = CHANNELS[channelId];
    intake.channel = channelId; // persisted inside the intake jsonb the client saves

    // Phase D calibration: this client's real past campaigns (silently skipped on any failure)
    const clientId: string | null = body.clientId ?? intake?.clientId ?? intake?.client_id ?? null;
    const pastCampaigns = clientId ? await fetchPastCampaigns(clientId, channelId) : [];

    const campaignContext = `
Campaign: ${intake.campaignName}
Goal: ${intake.goal}
Target Audience: ${intake.audience}
Platforms: ${intake.platforms?.join(', ') || 'Not specified'}
Brief: ${intake.brief}
    `.trim();

    // If a video was uploaded via Gemini Files API (legacy direct path), analyze it with Gemini first
    let videoAnalysis = '';
    if (geminiFileUri && geminiMimeType) {
      try {
        videoAnalysis = await analyzeVideoWithGemini(geminiFileUri, geminiMimeType, campaignContext);
      } catch (e) {
        console.error('Gemini video analysis failed:', e);
        videoAnalysis = '(Video analysis unavailable — analyze based on brief alone)';
      }
    }

    const textContent = `
CAMPAIGN TO ANALYZE:

Name: ${intake.campaignName}
Brief: ${intake.brief}
Goal: ${intake.goal}
Target Audience: ${intake.audience}
Platforms: ${intake.platforms?.join(', ') || 'Not specified'}
Budget: ${intake.budget || 'Not specified'}
Timeline: ${intake.timeline || 'Not specified'}
Tone/Mood: ${intake.tone || 'Not specified'}
Competitor Notes: ${intake.competitorNotes || 'None provided'}
${fileName ? `Uploaded File: ${fileName}` : ''}

${extractedMd ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXTRACTED CREATIVE CONTENT (full file content — this is your primary reference)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extractedMd}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The above is the FULL extracted content from the uploaded file. Every driver score and insight must reference specific details from the above content.` : ''}

${videoAnalysis ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIDEO CREATIVE ANALYSIS (from Gemini 1.5 Pro — watched the full video)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${videoAnalysis}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use the above video analysis as your primary creative reference. Every driver score and insight must reference specific moments, visuals, audio elements, and scenes described above.` : ''}

CLARIFICATION Q&A:
${clarification.questions.map((q: string, i: number) => `Q: ${q}\nA: ${clarification.answers[i] || '(no answer)'}`).join('\n\n')}

Produce an EXHAUSTIVE, IN-DEPTH analysis. Every section must be detailed and specific to this campaign. Reference the actual file content, campaign details, and clarification answers in every insight.
    `.trim();

    // Build message content — include PDF/image file if provided (not video — those go via Gemini)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageContent: any[] = [];

    if (fileBase64 && fileMediaType && !VIDEO_TYPES.includes(fileMediaType)) {
      if (fileMediaType === 'application/pdf') {
        messageContent.push({
          type: 'document',
          source: { type: 'base64', media_type: fileMediaType, data: fileBase64 },
        });
      } else if (fileMediaType.startsWith('image/')) {
        messageContent.push({
          type: 'image',
          source: { type: 'base64', media_type: fileMediaType, data: fileBase64 },
        });
      }
    }

    messageContent.push({ type: 'text', text: textContent });

    const response = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 32000,
      system: SYSTEM_PROMPT + buildChannelAddendum(channel) + (pastCampaigns.length ? buildCalibrationBlock(pastCampaigns) : ''),
      messages: [{ role: 'user', content: messageContent }],
      tools: [{
        name: 'submit_analysis',
        description: 'Submit the complete exhaustive campaign analysis',
        input_schema: channel.schemaVariant === 'lenses' ? LENS_SCHEMA : SCHEMA,
      }],
      tool_choice: { type: 'tool', name: 'submit_analysis' },
    }).finalMessage();

    const toolUse = response.content.find(b => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json({ error: 'No analysis returned' }, { status: 500 });
    }
    if (response.stop_reason === 'max_tokens' || !(toolUse.input as Record<string, unknown>).drivers) {
      return NextResponse.json({ error: 'Analysis was cut off before completion (output token limit). Please retry.' }, { status: 500 });
    }

    // Stamp channel + variant into the report JSON (deterministic — not left to the model)
    const analysis = {
      ...(toolUse.input as Record<string, unknown>),
      channel: channelId,
      schema_variant: channel.schemaVariant,
      calibration_context: pastCampaigns.length
        ? { used: true, campaign_count: pastCampaigns.length, campaign_names: pastCampaigns.map(c => c.name) }
        : { used: false },
    };
    return NextResponse.json({ analysis });
  } catch (err: unknown) {
    console.error('Analysis error:', err);
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
