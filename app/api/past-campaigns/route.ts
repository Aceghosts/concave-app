import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** True when Postgres says the past_campaigns table hasn't been created yet. */
function isTableMissing(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === '42P01' || /past_campaigns.*does not exist|relation .* does not exist/i.test(error.message ?? '');
}

// GET /api/past-campaigns            → list (newest first)
// GET /api/past-campaigns?client=id  → filtered by client
export async function GET(req: NextRequest) {
  try {
    const { supabaseServer } = await import('@/lib/supabase-server');
    const client = new URL(req.url).searchParams.get('client');

    let query = supabaseServer
      .from('past_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (client) query = query.eq('client_id', client);

    const { data, error } = await query;
    if (error) {
      if (isTableMissing(error)) {
        return NextResponse.json({ error: 'past_campaigns table does not exist', tableMissing: true }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

type IncomingRow = {
  name?: string;
  channel?: string | null;
  outcome_metrics?: Record<string, unknown>;
  creative_traits?: Record<string, unknown>;
};

// POST /api/past-campaigns → bulk insert
// Body: { clientId?: string, analysisId?: string, rows: [{ name, channel?, outcome_metrics?, creative_traits? }] }
// When analysisId is given, that analysis's report is turned into a scored trait
// profile (lib/traits deriveTraitProfile) and stored as creative_traits.profile
// on each inserted row. Existing CSV flow (no analysisId) is unchanged.
export async function POST(req: NextRequest) {
  try {
    const { supabaseServer } = await import('@/lib/supabase-server');
    const body = await req.json();
    const rows: IncomingRow[] = Array.isArray(body) ? body : body?.rows;
    const clientId: string | null = Array.isArray(body) ? null : body?.clientId || null;
    const analysisId: string | null = Array.isArray(body) ? null : body?.analysisId || null;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'rows array required' }, { status: 400 });
    }
    const invalid = rows.findIndex((r) => !r || typeof r.name !== 'string' || !r.name.trim());
    if (invalid !== -1) {
      return NextResponse.json({ error: `Row ${invalid + 1} is missing a name` }, { status: 400 });
    }

    // analysisId → derive a real trait profile from that stored analysis. Loud
    // failure when it can't be derived — never insert a half-true profile.
    let profile: import('@/lib/traits').TraitProfile | null = null;
    if (analysisId) {
      const { deriveTraitProfile } = await import('@/lib/traits');
      const { data: analysisRow, error: aErr } = await supabaseServer
        .from('analyses')
        .select('report')
        .eq('id', analysisId)
        .single();
      if (aErr || !analysisRow) {
        return NextResponse.json({ error: `Analysis ${analysisId} not found` }, { status: 400 });
      }
      profile = deriveTraitProfile(analysisRow.report);
      if (!profile) {
        return NextResponse.json({ error: `Analysis ${analysisId} has no scored drivers — cannot derive a trait profile` }, { status: 400 });
      }
    }

    const { data, error } = await supabaseServer
      .from('past_campaigns')
      .insert(
        rows.map((r) => ({
          client_id: clientId,
          name: r.name!.trim(),
          channel: r.channel?.toString().trim() || null,
          outcome_metrics: r.outcome_metrics ?? {},
          creative_traits: profile ? { ...(r.creative_traits ?? {}), profile } : (r.creative_traits ?? {}),
        }))
      )
      .select('id');

    if (error) {
      if (isTableMissing(error)) {
        return NextResponse.json({ error: 'past_campaigns table does not exist', tableMissing: true }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ inserted: data?.length ?? rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
