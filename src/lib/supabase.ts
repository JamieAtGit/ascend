import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cloud sync is optional: without env keys the app runs local-only and the
// Account panel shows setup instructions instead of a login form.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isCloudConfigured = supabase !== null;
