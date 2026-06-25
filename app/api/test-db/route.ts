import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Test anon key connection
  let anonFetch: string;
  try {
    const res = await fetch(`${url}/rest/v1/uploads?select=id&limit=1`, {
      headers: { apikey: anonKey!, Authorization: `Bearer ${anonKey}` },
    });
    anonFetch = `${res.status} ${await res.text()}`;
  } catch (e: unknown) {
    anonFetch = `fetch error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test service role key connection
  let serviceFetch: string;
  try {
    const res = await fetch(`${url}/rest/v1/uploads?select=id&limit=1`, {
      headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}` },
    });
    serviceFetch = `${res.status} ${await res.text()}`;
  } catch (e: unknown) {
    serviceFetch = `fetch error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test via supabase-js client with service role
  let supabaseJsTest: string;
  try {
    const client = createClient(url!, serviceKey!);
    const { data, error } = await client.from('uploads').select('id').limit(1);
    supabaseJsTest = error ? `error: ${error.message}` : `ok, rows: ${data?.length}`;
  } catch (e: unknown) {
    supabaseJsTest = `exception: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    version: 'v3',
    url,
    anonKeyPresent: !!anonKey,
    serviceKeyPresent: !!serviceKey,
    anonFetch,
    serviceFetch,
    supabaseJsTest: supabaseJsTest ?? 'not-reached',
  });
}
