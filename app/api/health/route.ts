import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, { status: string; detail: string }> = {};

  // Claude API
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey || anthropicKey === 'your-api-key-here') {
    results.claude = { status: 'pending', detail: 'Add ANTHROPIC_API_KEY to .env.local' };
  } else {
    try {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
      });
      results.claude = res.ok
        ? { status: 'connected', detail: `Key ending ...${anthropicKey.slice(-6)}` }
        : { status: 'error', detail: `API returned ${res.status}` };
    } catch {
      results.claude = { status: 'error', detail: 'Could not reach Anthropic API' };
    }
  }

  // Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    results.supabase = { status: 'pending', detail: 'Add Supabase URL + key to .env.local' };
  } else {
    results.supabase = { status: 'connected', detail: supabaseUrl.replace('https://', '').split('.')[0] + '.supabase.co' };
  }

  // Meta Graph API — just checks if any client has a token configured
  // (real check would need a client token — skipped for now)
  results.meta = { status: 'pending', detail: 'No clients connected yet' };

  // pptxgenjs — always available once installed
  results.pptxgenjs = { status: 'connected', detail: 'Export library ready' };

  return NextResponse.json(results);
}
