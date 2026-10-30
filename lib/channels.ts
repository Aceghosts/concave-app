// Channel-specific analysis apps (Brainsuite "ACE apps" parity) — Phase A.
// Consumed by app/api/analyze/route.ts: addendum merges into the system prompt,
// sub-KPI rubric replaces the default lists, script_storyboard swaps the 6
// drivers for 3 meta-lenses (Attention / Recognition / Motivation).

export type ChannelId =
  | 'campaign_brief'
  | 'social'
  | 'digital'
  | 'video'
  | 'script_storyboard';

export type SchemaVariant = 'drivers' | 'lenses';

export interface ChannelSubKpi {
  name: string;
  measures: string;
  red: string;
  amber: string;
  green: string;
}

export interface Channel {
  id: ChannelId;
  label: string;
  description: string;
  /** Asset kinds the intake should accept for this app */
  assetKinds: ('image' | 'video' | 'pdf' | 'text')[];
  /** 'lenses' = 3 meta-lenses (Attention/Recognition/Motivation) instead of the 6 drivers */
  schemaVariant: SchemaVariant;
  /** Channel-expertise block appended to the system prompt. Empty = default behavior. */
  promptAddendum: string;
  /**
   * Sub-KPI rubric keyed by driver key (or lens key for script_storyboard).
   * Empty object = use the default sub-KPI lists already in the base system prompt.
   */
  subKpis: Record<string, ChannelSubKpi[]>;
}

const kpi = (name: string, measures: string, red: string, amber: string, green: string): ChannelSubKpi =>
  ({ name, measures, red, amber, green });

export const CHANNELS: Record<ChannelId, Channel> = {
  campaign_brief: {
    id: 'campaign_brief',
    label: 'Campaign & Brief',
    description: 'Whole campaign, scored against the brief.',
    assetKinds: ['image', 'video', 'pdf', 'text'],
    schemaVariant: 'drivers',
    promptAddendum: '',
    subKpis: {},
  },

  social: {
    id: 'social',
    label: 'Social',
    description: 'Hook, scroll-stop power, platform fit.',
    assetKinds: ['image', 'video'],
    schemaVariant: 'drivers',
    promptAddendum: `ANALYSIS APP: SOCIAL
You are now operating as a social-feed creative specialist. The unit of analysis is ONE social asset in-feed, not a whole campaign.
Core truths of the medium: feed viewing is sound-off by default (~75-85% of initial views), average dwell is 1-3 seconds, the asset competes against friends' content not other ads, and each platform has hard mandatories (safe zones, aspect ratios, duration windows, caption behavior). Judge the asset at mobile size, in motion, with the thumb hovering.
For every platform the intake names, check its specific mandatories explicitly (e.g. Reels/TikTok 9:16 with UI-safe margins, Stories tap-through pacing, Meta feed 4:5, first-frame readability as a static thumbnail). If a mandatory cannot be verified from the materials, say so — never guess compliance.`,
    subKpis: {
      attention: [
        kpi('First-3-Seconds Hook', 'Does something arresting happen in the first 3s / first frame that earns the next second?',
          'Nothing happens before 3s — slow logo build or establishing shot', 'A hook exists but is generic or arrives late in the window', 'Immediate pattern interruption: motion, face, question, or visual oddity in frame 1'),
        kpi('Scroll-Stop Power', 'Thumb-stopping quality of the first frame against an endless feed of native content',
          'Looks like an ad at a glance; polished-stock feel invites the scroll', 'Stops some of the audience; relies on brand interest', 'Would stop a cold viewer who has never heard of the brand'),
        kpi('Sound-Off Comprehension', 'Is the message fully understood with audio muted (captions, supers, visual storytelling)?',
          'Meaning depends on voiceover or music; no captions', 'Partially readable muted; key beat still audio-dependent', 'Complete story lands with zero audio'),
        kpi('Focal Competition', 'How many elements fight for the eye at mobile size',
          'Cluttered frame; no single focal point', 'A focal point exists but competes with 2-3 secondary elements', 'One dominant focal point; hierarchy instantly clear'),
      ],
      branding: [
        kpi('Branding Timing', 'How early the brand is unmistakable (first 3 seconds for video, instantly for static)',
          'Brand only at the end card', 'Brand visible but passive or delayed past 3s', 'Brand integrated inside the hook itself'),
        kpi('Brand Asset Visibility', 'Presence and prominence of distinctive assets (logo, color, character, sonic) at thumbnail size',
          'Assets absent or illegible at mobile size', 'Assets present but small or low-contrast', 'Distinctive assets carry the frame and survive a thumbnail'),
        kpi('Product Presence', 'Share of attention the product itself earns across the asset',
          'Product absent or incidental', 'Product shown but not the hero of any moment', 'Product is the hero of a memorable moment'),
        kpi('Persistent Brand Cues', 'Brand recognizable at ANY random paused frame, not just bookends',
          'Most frames could belong to any brand', 'Roughly half the frames carry a brand cue', 'Every frame is attributable to the brand'),
      ],
      processing_ease: [
        kpi('Caption & Super Legibility', 'Text size, contrast and placement inside platform-safe zones at actual phone size',
          'Text too small, low contrast, or sits under platform UI', 'Legible but strained or partially cropped by UI', 'Effortlessly readable in safe zones at a glance'),
        kpi('Message Clarity (Sound-Off)', 'Can a distracted muted viewer state what this asset wants in one sentence?',
          'Message ambiguous or buried', 'Message inferable with effort', 'Message unmistakable in one glance'),
        kpi('Reading Time vs Dwell', 'Total words vs realistic 1-3s feed dwell (~3 words/sec)',
          'Word count far exceeds dwell; key copy will go unread', 'Readable only for engaged viewers', 'All on-screen copy consumable within natural dwell'),
        kpi('Visual Simplicity', 'Element count and layout complexity on a small screen',
          'Dense, busy composition', 'Moderately complex; some negative space', 'Clean composition with generous negative space'),
      ],
      strategic_fit: [
        kpi('Platform Mandatories', 'Compliance with each named platform\'s hard specs: aspect ratio, safe zones, duration, thumbnail behavior',
          'Violates a hard mandatory (wrong ratio, UI-covered text, over-duration)', 'Compliant but not optimized (letterboxed, generic crop)', 'Built natively for each placement\'s exact specs'),
        kpi('Native Feel', 'Does it feel made-for-the-platform rather than a repurposed TVC?',
          'Obvious repurposed broadcast/print asset', 'Adapted but still reads as an ad import', 'Indistinguishable from strong native creator content'),
        kpi('Audience Fit', 'Match to the stated audience\'s codes, references and feed behavior',
          'Tone-deaf to the audience\'s platform culture', 'Broadly acceptable but generic', 'Speaks the audience\'s exact visual and verbal codes'),
        kpi('Goal Fit', 'Does the asset mechanically deliver the stated campaign goal?',
          'Creative mechanics disconnected from the goal', 'Supports the goal indirectly', 'Every element ladders to the stated goal'),
      ],
      emotional_engagement: [
        kpi('Opening Emotion Spike', 'Emotional charge of the first moments (feeds reward instant feeling)',
          'Flat, neutral open', 'Mild interest or amusement', 'Immediate strong feeling: surprise, delight, tension, recognition'),
        kpi('Authenticity / Relatability', 'Does it feel human and credible for the feed context (UGC energy where appropriate)?',
          'Over-polished, corporate, or staged feel', 'Believable but unremarkable', 'Feels genuinely human; audience sees themselves in it'),
        kpi('Emotional Arc', 'Does the feeling develop across the asset rather than staying flat?',
          'One static note throughout', 'Some build but weak payoff', 'Clear build to a peak and satisfying resolution'),
        kpi('Share Trigger', 'Built-in reason to share, tag, duet or comment',
          'No social currency; nothing to pass on', 'Mildly shareable for a niche', 'Obvious share/tag mechanic or highly quotable moment'),
      ],
      persuasion: [
        kpi('CTA Clarity', 'Is the ask explicit, visible and unambiguous?',
          'No CTA or buried/vague ask', 'CTA present but passive or generic', 'Single sharp CTA a viewer can act on instantly'),
        kpi('CTA Timing', 'Does the CTA land while attention is still held (not only on a skippable end card)?',
          'CTA only after the natural drop-off point', 'CTA late but reachable', 'CTA seeded or shown while attention peaks'),
        kpi('Offer Clarity', 'Is what-you-get and why-now unmistakable?',
          'Offer absent or confusing', 'Offer stated but weak urgency or value framing', 'Compelling, concrete offer with a reason to act now'),
        kpi('Engagement Prompt', 'Does the asset invite comments/saves/interaction the algorithm rewards?',
          'Pure broadcast; no interaction hook', 'Implicit invitation only', 'Explicit, natural prompt to comment, save or participate'),
      ],
    },
  },

  digital: {
    id: 'digital',
    label: 'Digital / Display',
    description: 'Banners: legibility, CTA, format fit.',
    assetKinds: ['image', 'pdf'],
    schemaVariant: 'drivers',
    promptAddendum: `ANALYSIS APP: DIGITAL / DISPLAY
You are now operating as a display-advertising specialist. The unit of analysis is a display/banner unit seen peripherally for well under 1 second on a cluttered page, often at small rendered sizes (300x250, 728x90, 320x50 and similar).
Core truths of the medium: banner blindness is the default — the unit must defeat learned avoidance; everything must work at ACTUAL rendered pixel size, not the design file size; one message, one visual, one CTA is the ceiling of what a display unit can carry; animation gets limited loops and the end frame must stand alone. Judge every element at final rendered size and assume a sub-second glance.`,
    subKpis: {
      attention: [
        kpi('Visual Hierarchy at Size', 'Clear 1-2-3 eye path at actual rendered banner size',
          'No discernible hierarchy at small size', 'Hierarchy visible but weak contrast between levels', 'Instant 1-2-3 read: visual → message → CTA'),
        kpi('First-Glance Hook', 'Does anything defeat banner blindness in a peripheral glance?',
          'Generic stock-ad look; invisible to a blind-by-default eye', 'Some contrast against typical page content', 'Strong pattern interruption: unexpected visual, bold contrast, or motion'),
        kpi('Focal Competition', 'Element count fighting for a sub-second glance',
          '4+ competing elements', '2-3 elements with partial hierarchy', 'One hero element dominates'),
        kpi('Motion / End-Frame Discipline', 'If animated: does motion attract without obscuring, and does the end frame stand alone?',
          'Motion hides the message or end frame is incomplete', 'Motion decorative; end frame adequate', 'Motion directs the eye to the message; end frame is a complete static ad'),
      ],
      branding: [
        kpi('Logo Visibility', 'Logo size, contrast and placement at rendered size',
          'Logo illegible or missing at actual size', 'Logo present but small or low-contrast', 'Logo instantly identifiable in peripheral vision'),
        kpi('Brand Color Coverage', 'Distinctive brand colors/assets carrying attribution across the unit',
          'Unit could belong to any brand', 'Some brand assets but attribution requires reading', 'Brand attributable from color/assets alone, pre-reading'),
        kpi('Product Attention', 'Prominence and recognizability of the product at banner size',
          'Product absent or unrecognizable when small', 'Product shown but secondary', 'Product is the visual hero and reads at a glance'),
        kpi('Recognition at Thumbnail', 'Would the brand register even on the smallest placement (320x50)?',
          'Branding collapses at the smallest sizes', 'Survives medium sizes only', 'Branding engineered to survive every spec size'),
      ],
      processing_ease: [
        kpi('Legibility at Actual Size', 'Font size and contrast at real rendered pixels, not the design comp',
          'Body copy illegible at rendered size', 'Headline legible; supporting copy strained', 'Every retained word effortlessly legible'),
        kpi('Message Hierarchy', 'One clear primary message, with secondary info subordinated or cut',
          'Multiple competing messages', 'Primary message discernible but diluted', 'Single-minded message; nothing competes'),
        kpi('Word Count vs Glance Time', 'Copy volume vs sub-second display glance',
          'Paragraphs of copy; most will never be read', 'More words than a glance allows', '7 words or fewer carry the whole message'),
        kpi('Visual Simplicity', 'Composition complexity within tiny real estate',
          'Crowded, no negative space', 'Acceptable density', 'Ruthlessly simple; air around every element'),
      ],
      strategic_fit: [
        kpi('Format Fit', 'Designed for the actual placement specs and sizes, not one master crop',
          'One size awkwardly cropped to others', 'Adapted per size but hierarchy breaks in some', 'Each size recomposed so hierarchy holds everywhere'),
        kpi('Context Fit', 'Appropriateness to the page environments and buying context where it will serve',
          'Jarring or irrelevant to likely placements', 'Neutral fit', 'Turns the surrounding context to its advantage'),
        kpi('Audience Fit', 'Visual and verbal match to the stated audience',
          'Misses the audience\'s codes', 'Broadly appropriate, generic', 'Precisely tuned to the stated audience'),
        kpi('Goal Fit', 'Does the unit mechanically serve the stated objective (traffic, awareness, retargeting)?',
          'Unit mechanics mismatch the goal', 'Indirect support', 'Unit built around the goal\'s exact mechanic'),
      ],
      emotional_engagement: [
        kpi('Visual Activation', 'Arousal/energy of the imagery within a static/short-loop unit',
          'Inert, lifeless visual', 'Moderate energy', 'High-activation imagery that transmits in a glance'),
        kpi('Visual Sentiment', 'Valence of the imagery and whether it suits the goal',
          'Sentiment wrong for the goal or negative without purpose', 'Neutral valence', 'Valence precisely matched to the desired response'),
        kpi('Text Charge', 'Emotional energy of the few words used',
          'Flat, functional copy', 'Some charge but clichéd', 'Charged, specific wording that provokes feeling fast'),
        kpi('Aspirational Pull', 'Does the unit connect to an identity or desire, not just an announcement?',
          'Pure announcement; no desire hook', 'Implied benefit only', 'Clear identity/desire hook a glance can absorb'),
      ],
      persuasion: [
        kpi('CTA Prominence', 'Is the CTA visually unmissable (button convention, contrast, placement)?',
          'CTA absent or camouflaged', 'CTA present but under-weighted', 'CTA is a clear, high-contrast, conventional click target'),
        kpi('CTA Copy Strength', 'Specificity and motivation of the CTA wording',
          'Generic "Learn More" with no motivation', 'Standard verb with mild specificity', 'Specific, benefit-loaded action phrase'),
        kpi('Offer Clarity', 'Is the value exchange explicit within the unit itself?',
          'No discernible offer', 'Offer implied, not stated', 'Concrete offer stated in the unit'),
        kpi('Click Motivation', 'Does the unit give a reason to click NOW (Fogg: motivation x ability x trigger)?',
          'No trigger; clicking has no evident payoff', 'Payoff evident but no urgency', 'Clear payoff plus urgency or curiosity trigger'),
      ],
    },
  },

  video: {
    id: 'video',
    label: 'Video / TVC',
    description: 'Film & TVC, scene by scene.',
    assetKinds: ['video', 'pdf', 'text'],
    schemaVariant: 'drivers',
    promptAddendum: `ANALYSIS APP: VIDEO / TVC
You are now operating as a film/TVC craft specialist. The unit of analysis is a video narrative over time — judge it scene by scene, not as a single frame.
Core truths of the medium: attention decays non-linearly and every cut, lull or confusion point is a drop-off risk — identify WHERE in the timeline risk concentrates; branding must be woven into the story (branding moments), not bolted to an end card; the master must survive cutdowns (30s/15s/6s) and the hook must survive skippable pre-roll (5s to earn the view). Where a scene-level analysis or timestamps are available, reference specific scenes and times in every insight. If only a script or description is available, assess scene-by-scene from that and flag the limitation.`,
    subKpis: {
      attention: [
        kpi('Opening Hook', 'Does the first 5 seconds earn the rest of the film (skippable pre-roll test)?',
          'Slow establishing open; skipped before the story starts', 'Open is pleasant but not gripping', 'First 5s create a question or jolt that demands resolution'),
        kpi('Scene-by-Scene Attention Risk', 'Where in the timeline do lulls, confusion or repetition invite drop-off?',
          'Multiple dead zones or a sagging middle', 'One identifiable lull', 'No scene outstays its welcome; each hands momentum to the next'),
        kpi('Pacing & Cut Rhythm', 'Edit rhythm and energy appropriate to the story and platform',
          'Monotonous pace or chaotic cutting that exhausts', 'Serviceable rhythm with flat stretches', 'Rhythm breathes: tension and release deliberately controlled'),
        kpi('Pattern Interruption', 'Moments of genuine surprise that reset attention mid-film',
          'Entirely predictable beat sheet', 'One mild surprise', 'Deliberate resets keep the viewer re-hooked'),
      ],
      branding: [
        kpi('Earliest Brand Moment', 'How early the brand is unmistakably present',
          'Brand only in the final seconds', 'Brand appears by midpoint', 'Brand present or implied inside the opening'),
        kpi('Branding Moments Density', 'Brand woven through the narrative vs bookended',
          'Story and brand are separable; brand feels pasted on', 'A few integrated brand beats', 'Brand inseparable from the story\'s best moments'),
        kpi('Sonic & End-Card Craft', 'Audio branding and closing lockup quality',
          'No sonic identity; weak or rushed end card', 'Standard end card, no sonic asset', 'Distinctive sonic cue plus an end card that rewards'),
        kpi('Product Role in Narrative', 'Is the product a character in the story or a prop?',
          'Product absent from the narrative logic', 'Product shown but swappable', 'Story only works because of this product'),
      ],
      processing_ease: [
        kpi('Narrative Clarity', 'Can a first-time viewer follow the story without rewinding?',
          'Confusing sequence or unclear protagonist/stakes', 'Followable with mild effort', 'Effortlessly clear arc: setup, tension, resolution'),
        kpi('Message Load per Scene', 'One idea at a time vs stacked messages',
          'Scenes carry multiple competing messages', 'Mostly single-idea scenes with exceptions', 'Each scene advances exactly one idea'),
        kpi('Supers & VO Legibility', 'On-screen text and voiceover clarity, pacing and redundancy',
          'Supers too fast/small; VO rushed or muddy', 'Readable but demanding', 'Supers and VO paced for effortless absorption'),
        kpi('Single-Minded Proposition', 'Does the whole film ladder to ONE takeaway?',
          'Viewer cannot state the takeaway', 'Takeaway stated but diluted by subplots', 'One sentence takeaway any viewer could repeat'),
      ],
      strategic_fit: [
        kpi('Goal Fit', 'Does the film mechanically deliver the stated campaign goal?',
          'Beautiful film, disconnected from the goal', 'Indirect support for the goal', 'Film engineered around the goal'),
        kpi('Audience Fit', 'Casting, world, codes and references match the stated audience',
          'World and casting miss the audience', 'Broadly relatable, not specific', 'Audience sees their exact world on screen'),
        kpi('Media Context Fit', 'Right length and grammar for where it will actually run',
          'Wrong duration/grammar for the stated media plan', 'Works in primary placement only', 'Native to every stated placement'),
        kpi('Cutdown Readiness', 'Does the idea survive 15s and 6s edits (modular structure, early payload)?',
          'Idea only exists at full length; cutdowns would be noise', 'A 15s exists but loses the idea\'s power', 'Modular build: hook, brand and message all live in the first 6-15s'),
      ],
      emotional_engagement: [
        kpi('Emotional Arc', 'Designed journey of feeling across the timeline',
          'Emotionally flat throughout', 'Arc exists but peaks weakly', 'Deliberate build to a genuine peak'),
        kpi('Peak Moment Strength', 'Power of the single most intense moment (Peak-End Rule)',
          'No identifiable peak', 'A peak exists but is conventional', 'A peak viewers will remember and retell'),
        kpi('Ending Payoff', 'Does the ending land the feeling and the brand together?',
          'Fizzles out or ends on logistics', 'Clean but forgettable close', 'Ending fuses emotional payoff with brand'),
        kpi('Cultural Resonance', 'Authenticity to the target audience\'s culture as stated in the brief',
          'Cultural notes false or imported', 'Culturally safe, surface-level', 'Deep, specific cultural truth handled authentically'),
      ],
      persuasion: [
        kpi('CTA Delivery', 'Clarity and craft of the ask within the film\'s grammar',
          'No ask, or an ask that breaks the film\'s spell clumsily', 'Standard end-card CTA', 'Ask flows naturally from the story\'s conclusion'),
        kpi('Message Memorability', 'Will the key message survive 24 hours in memory?',
          'Nothing sticky: no device, line or image to retain', 'One moderately retainable element', 'A line, sound or image engineered to stick'),
        kpi('Urgency & Reason to Act', 'Concrete reason to act now vs pure brand feeling',
          'No bridge from feeling to action', 'Soft nudge only', 'Clear, credible reason to act within the film'),
        kpi('Persuasion Flow (AIDA)', 'Does the film move Attention → Interest → Desire → Action without stalling?',
          'Stalls at attention or interest; desire never built', 'Flows but one stage is weak', 'All four stages land in sequence'),
      ],
    },
  },

  script_storyboard: {
    id: 'script_storyboard',
    label: 'Script & Storyboard',
    description: 'Scripts & concepts, before production.',
    assetKinds: ['pdf', 'text', 'image'],
    schemaVariant: 'lenses',
    promptAddendum: `ANALYSIS APP: SCRIPT & STORYBOARD (pre-production)
You are now operating as a pre-production script and storyboard evaluator — the stage BEFORE anything is shot. You evaluate the words and frames on the page; you NEVER rewrite, generate alternative lines, or produce new creative. Recommendations describe what to strengthen and why, never supply replacement copy or scenes.
OUTPUT CHANGE — 3 META-LENSES REPLACE THE 6 DRIVERS. Ignore the 6-driver structure and its sub-KPI lists above. Score exactly three lenses, each 0-10 with its own sub-KPIs, deep analysis, strengths, weaknesses, recommendations and benchmark context:
1. ATTENTION — will this script/storyboard, once produced, capture and hold attention? Scene-level risks, hooks, pacing on the page, open loops.
2. RECOGNITION — will the brand be recognized and remembered? Structured coverage of branding opportunities: where the script creates (or misses) brand moments, distinctive assets, product integration.
3. MOTIVATION — will it move the audience to feel and act? Persuasion drivers coverage, emotional journey as written, connection to real audience needs, strength of the resolution/ask.
Provide structured coverage: systematically flag storytelling gaps, missed branding opportunities, and absent persuasion drivers — scene by scene where the material allows. Everything is an assessment of POTENTIAL once produced; say so when production execution could change a verdict. The overall_score is the average of the three lens scores.`,
    subKpis: {
      attention: [
        kpi('Opening Hook on Paper', 'Does the scripted opening create an immediate question, image or jolt as written?',
          'Opens on setup/logistics; no hook written in', 'Hook idea present but under-written', 'Opening beat demands continuation even in text form'),
        kpi('Scene-Level Attention Risks', 'Scenes that will drag, confuse or repeat once produced',
          'Several scenes with no attention job', 'One or two risky passages', 'Every scene has a clear attention job and earns its length'),
        kpi('Curiosity & Open Loops', 'Written-in tension, questions or gaps that pull the viewer forward',
          'Everything revealed immediately; no forward pull', 'Some withheld information, weakly exploited', 'Deliberate open loops resolved at the right moments'),
        kpi('Pacing on the Page', 'Scene lengths and beat distribution implying a healthy produced rhythm',
          'Front- or back-loaded; long undifferentiated passages', 'Workable pacing with a soft middle', 'Beat sheet implies a taut, well-distributed rhythm'),
      ],
      recognition: [
        kpi('Branding Opportunities Coverage', 'Does the script create deliberate brand moments, and where are the misses?',
          'Brand moments unwritten; branding left to post', 'Brand moments exist at bookends only', 'Brand moments scripted throughout at natural story beats'),
        kpi('Earliest Scripted Brand Moment', 'How early the brand enters as written',
          'Brand first appears in the closing scene', 'Brand enters by the midpoint', 'Brand present or implied from the opening beats'),
        kpi('Distinctive Asset Usage', 'Are distinctive assets (color, character, line, sonic cue) written into the material?',
          'No distinctive assets specified anywhere', 'Assets mentioned but not woven into action', 'Assets written as functioning story elements'),
        kpi('Product Integration', 'Is the product structural to the plot as written, or set dressing?',
          'Script works identically without the product', 'Product featured but replaceable', 'Plot logic depends on the product'),
      ],
      motivation: [
        kpi('Persuasion Drivers Coverage', 'Which persuasion mechanics (social proof, loss aversion, scarcity, reciprocity…) are written in — and which are absent?',
          'No persuasion mechanic present in the text', 'One or two mechanics, weakly deployed', 'Multiple mechanics deliberately and natively woven in'),
        kpi('Emotional Journey as Written', 'Does the text construct a feel-this-then-that arc with a peak?',
          'No emotional design; events without feeling', 'Arc sketched but peak under-written', 'Precise emotional architecture with an earned peak'),
        kpi('Audience Need Connection', 'Does the material speak to a real, stated need or desire of the target audience?',
          'No connection to a real audience need', 'Generic category need only', 'Rooted in a specific, resonant audience truth'),
        kpi('Resolution & Ask Strength', 'Does the ending as written convert the built feeling into a clear next step?',
          'Ends without an ask or resolution', 'Ask present but disconnected from the emotional build', 'Resolution fuses payoff, brand and a motivated ask'),
      ],
    },
  },
};

export const DEFAULT_CHANNEL: ChannelId = 'campaign_brief';

export function isChannelId(v: unknown): v is ChannelId {
  return typeof v === 'string' && v in CHANNELS;
}

/** Lens keys used in the `drivers` map when schemaVariant === 'lenses'. */
export const LENS_KEYS = ['attention', 'recognition', 'motivation'] as const;

const DRIVER_LABELS: Record<string, string> = {
  attention: 'ATTENTION',
  branding: 'BRANDING',
  processing_ease: 'PROCESSING EASE',
  strategic_fit: 'STRATEGIC FIT',
  emotional_engagement: 'EMOTIONAL ENGAGEMENT',
  persuasion: 'PERSUASION',
  recognition: 'RECOGNITION',
  motivation: 'MOTIVATION',
};

/**
 * Full system-prompt addendum for a channel: expertise block + sub-KPI rubric
 * (which replaces the default sub-KPI lists). Empty string for campaign_brief,
 * so the default app's prompt is byte-identical to today's.
 */
export function buildChannelAddendum(channel: Channel): string {
  if (!channel.promptAddendum && Object.keys(channel.subKpis).length === 0) return '';

  const rubric = Object.entries(channel.subKpis)
    .map(([key, kpis]) => {
      const lines = kpis.map(k =>
        `• ${k.name} — ${k.measures}\n  red (<40): ${k.red} | amber (40-69): ${k.amber} | green (70+): ${k.green}`
      ).join('\n');
      return `${DRIVER_LABELS[key] ?? key.toUpperCase()} sub-KPIs:\n${lines}`;
    })
    .join('\n\n');

  return `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${channel.promptAddendum}

CHANNEL SUB-KPI RUBRIC (REPLACES the default sub-KPI lists above — score EVERY sub-KPI below, 0-100, same status thresholds, verdict + evidence rules, and the same honesty rules: no fabricated benchmarks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${rubric}`;
}
