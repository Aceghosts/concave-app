import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Meta Marketing API sync scaffolding (v1): pulls ad-level insights from the
// Graph API and upserts them into past_campaigns as real measured outcomes.
// Honesty rules: when not configured or the Graph call fails, the REAL error is
// returned — never sample data. Only fields Meta actually returned are stored.
// ponytail: single page of results, no pagination/token refresh — add when a
// synced account has >500 ads or long-lived tokens are needed.

const GRAPH_VERSION = 'v21.0';

type InsightRow = {
  ad_name?: string;
  impressions?: string;
  ctr?: string;
  cpm?: string;
  spend?: string;
  actions?: { action_type: string; value: string }[];
};

// POST /api/meta/sync  Body: { adAccountId: string, clientId?: string }
export async function POST(req: NextRequest) {
  try {
    const token = process.env.META_ACCESS_TOKEN?.trim();
    if (!process.env.META_APP_ID?.trim() || !process.env.META_APP_SECRET?.trim() || !token) {
      return NextResponse.json(
        { error: 'Meta is not configured. Set META_APP_ID, META_APP_SECRET and META_ACCESS_TOKEN in the environment.' },
        { status: 503 },
      );
    }

    const body = await req.json();
    const adAccountId: string = (body?.adAccountId ?? '').toString().trim().replace(/^act_/, '');
    const clientId: string | null = body?.clientId || null;
    if (!adAccountId) return NextResponse.json({ error: 'adAccountId required' }, { status: 400 });

    const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/insights`);
    url.searchParams.set('level', 'ad');
    url.searchParams.set('fields', 'ad_name,impressions,ctr,cpm,spend,actions');
    url.searchParams.set('date_preset', 'last_90d');
    url.searchParams.set('limit', '100');
    url.searchParams.set('access_token', token);

    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      // Return Meta's real error, verbatim — never mask it, never fake rows.
      const msg = json?.error?.message || `Graph API returned HTTP ${res.status}`;
      return NextResponse.json({ error: `Meta Graph API error: ${msg}` }, { status: 502 });
    }

    const insights: InsightRow[] = Array.isArray(json?.data) ? json.data : [];
    if (insights.length === 0) {
      return NextResponse.json({ synced: 0, skipped: 0, message: 'Meta returned no ad insights for the last 90 days.' });
    }

    const { supabaseServer } = await import('@/lib/supabase-server');

    // Dedupe by name + client: skip ads already stored for this client.
    let existingQuery = supabaseServer.from('past_campaigns').select('name').limit(1000);
    existingQuery = clientId ? existingQuery.eq('client_id', clientId) : existingQuery.is('client_id', null);
    const { data: existing, error: exErr } = await existingQuery;
    if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });
    const existingNames = new Set((existing ?? []).map((r) => r.name));

    const rows = insights
      .filter((r): r is InsightRow & { ad_name: string } => typeof r.ad_name === 'string' && !!r.ad_name.trim())
      .filter((r) => !existingNames.has(r.ad_name.trim()))
      .map((r) => {
        // Only fields Meta actually returned — nothing synthesized.
        const outcome_metrics: Record<string, unknown> = {};
        if (r.impressions !== undefined) outcome_metrics.impressions = Number(r.impressions);
        if (r.ctr !== undefined) outcome_metrics.ctr = Number(r.ctr);
        if (r.cpm !== undefined) outcome_metrics.cpm = Number(r.cpm);
        if (r.spend !== undefined) outcome_metrics.spend = Number(r.spend);
        if (Array.isArray(r.actions)) {
          for (const a of r.actions) outcome_metrics[`actions.${a.action_type}`] = Number(a.value);
        }
        return {
          client_id: clientId,
          name: r.ad_name.trim(),
          channel: 'social',
          outcome_metrics,
          creative_traits: { source: 'meta', ad_account_id: adAccountId },
        };
      });

    if (rows.length === 0) {
      return NextResponse.json({ synced: 0, skipped: insights.length, message: 'All returned ads already exist for this client.' });
    }

    const { error: insErr } = await supabaseServer.from('past_campaigns').insert(rows);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ synced: rows.length, skipped: insights.length - rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Meta sync failed' }, { status: 500 });
  }
}
