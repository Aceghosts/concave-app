import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // First test raw fetch to see if Supabase is reachable
  let rawFetch: string;
  try {
    const res = await fetch(`${url}/rest/v1/clients?select=*&limit=1`, {
      headers: { apikey: key!, Authorization: `Bearer ${key}` },
    });
    rawFetch = `${res.status} ${await res.text()}`;
  } catch (e: unknown) {
    rawFetch = `fetch error: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test via supabase-js client
  const { data, error } = await supabase.from('clients').select('*').limit(5);

  return NextResponse.json({
    env: { url, keyPresent: !!key },
    rawFetch,
    supabaseJs: { count: data?.length ?? 0, error: error?.message },
  });
}
