import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import https from 'https';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  function errDetail(e: unknown): string {
    if (!(e instanceof Error)) return String(e);
    const cause = (e as NodeJS.ErrnoException & { cause?: unknown }).cause;
    return `${e.message}${cause ? ` | cause: ${cause instanceof Error ? cause.message : String(cause)}` : ''}`;
  }

  // Test general internet connectivity via fetch
  let internetTest: string;
  try {
    const res = await fetch('https://httpbin.org/get', { signal: AbortSignal.timeout(5000) });
    internetTest = `fetch:${res.status}`;
  } catch (e: unknown) {
    internetTest = `fetch failed: ${errDetail(e)}`;
  }

  // Test via native https module
  let httpsTest: string;
  try {
    httpsTest = await new Promise((resolve, reject) => {
      const req = https.get('https://httpbin.org/get', (res) => {
        resolve(`https:${res.statusCode}`);
        res.resume();
      });
      req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
      req.on('error', reject);
    });
  } catch (e: unknown) {
    httpsTest = `https failed: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test anon key connection
  let anonFetch: string;
  try {
    const res = await fetch(`${url}/rest/v1/uploads?select=id&limit=1`, {
      headers: { apikey: anonKey!, Authorization: `Bearer ${anonKey}` },
      signal: AbortSignal.timeout(10000),
    });
    anonFetch = `${res.status} ${await res.text()}`;
  } catch (e: unknown) {
    anonFetch = `failed: ${errDetail(e)}`;
  }

  // Test via supabase-js client with service role
  let supabaseJsTest: string;
  try {
    const client = createClient(url!, serviceKey!);
    const { data, error } = await client.from('uploads').select('id').limit(1);
    supabaseJsTest = error ? `error: ${error.message}` : `ok, rows: ${data?.length}`;
  } catch (e: unknown) {
    supabaseJsTest = `exception: ${errDetail(e)}`;
  }

  return NextResponse.json({
    version: 'v7',
    httpsTest,
    url,
    urlRaw: JSON.stringify(url),
    urlLength: url?.length,
    anonKeyPresent: !!anonKey,
    serviceKeyPresent: !!serviceKey,
    internetTest,
    anonFetch,
    supabaseJsTest,
  });
}
