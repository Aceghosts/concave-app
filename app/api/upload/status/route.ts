import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const uploadId = req.nextUrl.searchParams.get('id');
  if (!uploadId) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { supabaseServer } = await import('@/lib/supabase-server');
  const { data, error } = await supabaseServer
    .from('uploads')
    .select('*') // '*' so the query still works before supabase/frames.sql adds the frame columns
    .eq('id', uploadId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: data.status,           // pending | processing | ready | failed
    extractedMd: data.extracted_md,
    fileName: data.file_name,
    mimeType: data.mime_type,
    error: data.error,
    // Phase E2 (additive): rendered deck pages / video keyframes, when present
    framePaths: data.frame_paths ?? null,
    frameCount: data.frame_count ?? null,
    frameKind: data.frame_kind ?? null,
  });
}
