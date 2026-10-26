import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const META_ENV_VARS = ['META_APP_ID', 'META_APP_SECRET', 'META_ACCESS_TOKEN'] as const;

// GET /api/meta/status → { configured, missing } from real env presence. No probing, no pretending.
export async function GET() {
  const missing = META_ENV_VARS.filter((k) => !process.env[k]?.trim());
  return NextResponse.json({ configured: missing.length === 0, missing });
}
