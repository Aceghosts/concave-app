import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/analyses          → list (newest first)
// GET /api/analyses?id=uuid  → single analysis
export async function GET(req: NextRequest) {
  try {
    const { supabaseServer } = await import('@/lib/supabase-server');
    const id = new URL(req.url).searchParams.get('id');

    if (id) {
      const { data, error } = await supabaseServer.from('analyses').select('*').eq('id', id).single();
      if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(data);
    }

    const { data, error } = await supabaseServer
      .from('analyses')
      .select('id, campaign_name, client_id, overall_score, grade, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

// POST /api/analyses → save a completed analysis, returns { id }
export async function POST(req: NextRequest) {
  try {
    const { supabaseServer } = await import('@/lib/supabase-server');
    const { campaignName, clientId, intake, report } = await req.json();
    if (!campaignName || !report) return NextResponse.json({ error: 'campaignName and report required' }, { status: 400 });

    const { data, error } = await supabaseServer
      .from('analyses')
      .insert({
        campaign_name: campaignName,
        client_id: clientId || null,
        overall_score: report.overall_score ?? null,
        grade: report.grade ?? null,
        intake,
        report,
      })
      .select('id')
      .single();

    if (error || !data) return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 500 });
    return NextResponse.json({ id: data.id });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
