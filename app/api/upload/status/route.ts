import { NextRequest, NextResponse } from 'next/server';

// Poll Gemini file processing state
export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 500 });

  const fileName = req.nextUrl.searchParams.get('name'); // e.g. "files/abc123"
  if (!fileName) return NextResponse.json({ error: 'name param required' }, { status: 400 });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`
    );
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: 500 });
    }
    const file = await res.json();
    // file.state: PROCESSING | ACTIVE | FAILED
    return NextResponse.json({ state: file.state, uri: file.uri, mimeType: file.mimeType });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
