import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { supabaseServer } = await import('@/lib/supabase-server');
    const { inngest } = await import('@/lib/inngest');

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('clientId') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Upload raw file to Supabase Storage
    const storagePath = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: storageError } = await supabaseServer.storage
      .from('campaign-files')
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (storageError) {
      return NextResponse.json({ error: `Storage upload failed: ${storageError.message}` }, { status: 500 });
    }

    // Create uploads row
    const { data: uploadRow, error: dbError } = await supabaseServer
      .from('uploads')
      .insert({
        client_id: clientId || null,
        file_name: file.name,
        mime_type: file.type,
        storage_path: storagePath,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError || !uploadRow) {
      return NextResponse.json({ error: `DB insert failed: ${dbError?.message}` }, { status: 500 });
    }

    // Fire Inngest background job
    await inngest.send({
      name: 'file/process',
      data: {
        uploadId: uploadRow.id,
        storagePath,
        fileName: file.name,
        mimeType: file.type,
        clientId: clientId || null,
      },
    });

    return NextResponse.json({ uploadId: uploadRow.id });
  } catch (err: unknown) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
  }
}
