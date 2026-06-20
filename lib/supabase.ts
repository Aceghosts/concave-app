import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

export type DbClient = {
  id: string;
  name: string;
  industry: string;
  meta_connected: boolean;
  meta_page_id: string | null;
  meta_ad_account_id: string | null;
  created_at: string;
};
