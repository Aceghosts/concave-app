import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

// Returns a signed upload URL so the browser can upload directly to Supabase Storage
// This bypasses Vercel's 4.5MB body limit entirely
export async function POST(req: NextRequest) {
  try {
    const { supabaseServer } = await import('@/lib/supabase-server');
    const { fileName, mimeType, clientId } = await req.json();

    if (!fileName || !mimeType) {
      return NextResponse.json({ error: 'fileName and mimeType required' }, { status: 400 });
    }

    const storagePath = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Create a signed upload URL (browser uploads directly to Supabase)
    const { data: signedData, error: signedError } = await supabaseServer.storage
      .from('campaign-files')
      .createSignedUploadUrl(storagePath);

    if (signedError || !signedData) {
      console.error('Signed URL error:', signedError);
      return NextResponse.json({ error: `Failed to create upload URL: ${signedError?.message}` }, { status: 500 });
    }

    // Pre-create the uploads row so we have an ID to poll
    const { data: uploadRow, error: dbError } = await supabaseServer
      .from('uploads')
      .insert({
        client_id: clientId || null,
        file_name: fileName,
        mime_type: mimeType,
        storage_path: storagePath,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError || !uploadRow) {
      console.error('DB error:', dbError);
      return NextResponse.json({ error: `DB insert failed: ${dbError?.message}` }, { status: 500 });
    }

    return NextResponse.json({
      uploadId: uploadRow.id,
      signedUrl: signedData.signedUrl,
      storagePath,
    });
  } catch (err: unknown) {
    console.error('Upload init error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
  }
}

// Called after browser finishes uploading — triggers Inngest processing job
export async function PUT(req: NextRequest) {
  try {
    const { inngest } = await import('@/lib/inngest');
    const { uploadId, storagePath, fileName, mimeType, clientId } = await req.json();

    await inngest.send({
      name: 'file/process',
      data: { uploadId, storagePath, fileName, mimeType, clientId: clientId || null },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('Trigger error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Trigger failed' }, { status: 500 });
  }
}
