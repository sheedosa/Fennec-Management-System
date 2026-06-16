import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";

/**
 * Whether Supabase connection config is available. With the public defaults
 * in config.ts this is always true; the check remains so the ConfigNotice
 * still triggers if someone removes the defaults and sets no env vars.
 */
export function supabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}
