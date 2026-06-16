import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client — BYPASSES RLS. Server-only (the `server-only` import
// makes the build fail if this is ever pulled into a client bundle).
// Use ONLY for trusted server operations that legitimately need to cross
// the RLS boundary: the one-time import wizard and scheduled jobs. Every
// call MUST scope writes to an org_id the caller is authorized for.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
