// Public Supabase connection config.
//
// The URL and the ANON key are PUBLIC by design — the anon key is embedded in
// the browser bundle of every Supabase app and is gated by Row-Level Security,
// not by secrecy. So we fall back to the project's own values when the env
// vars aren't set, which keeps the deployment working even before Vercel env
// vars are configured. Setting NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY overrides
// these (e.g. to point a fork at a different project).
//
// The SERVICE-ROLE key is NOT here — it is a true secret and only ever read
// from process.env in lib/supabase/admin.ts (server-only).

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fesycrujoyffvvvdlzuq.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3ljcnVqb3lmZnZ2dmRsenVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDc2MjQsImV4cCI6MjA5NzE4MzYyNH0.yeIh4ZFG024RDCj2iV7Ur4aiQtiEml1GgX1G2dD0JWM";
