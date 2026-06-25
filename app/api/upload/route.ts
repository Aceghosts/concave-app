import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

// Step 1 — client calls this to get a Gemini resumable upload URL
// The actual file bytes are then uploaded directly from the browser to Gemini,
// bypassing Vercel's body size limit entirely.
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google AI API key not configured' }, { status: 500 });
    }

    const { fileName, mimeType, fileSize } = await req.json();
    if (!fileName || !mimeType || !fileSize) {
      return NextResponse.json({ error: 'fileName, mimeType, fileSize required' }, { status: 400 });
    }

    // Initiate a resumable upload session with Gemini Files API
    const initRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': String(fileSize),
          'X-Goog-Upload-Header-Content-Type': mimeType,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: { display_name: fileName } }),
      }
    );

    if (!initRes.ok) {
      const err = await initRes.text();
      return NextResponse.json({ error: `Gemini init failed: ${err}` }, { status: 500 });
    }

    const uploadUrl = initRes.headers.get('x-goog-upload-url');
    if (!uploadUrl) {
      return NextResponse.json({ error: 'No upload URL returned by Gemini' }, { status: 500 });
    }

    return NextResponse.json({ uploadUrl });
  } catch (err: unknown) {
    console.error('Upload init error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
