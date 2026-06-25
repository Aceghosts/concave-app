import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

// Server-side client using service role key — never expose to browser
export const supabaseServer = createClient(url, key, {
  auth: { persistSession: false },
});

export type DbUpload = {
  id: string;
  client_id: string | null;
  file_name: string;
  mime_type: string;
  storage_path: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  extracted_md: string | null;
  error: string | null;
  created_at: string;
};
