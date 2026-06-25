import { createClient } from '@supabase/supabase-js';

// Server-side client using service role key — never expose to browser
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

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
