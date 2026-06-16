# Fennec Management System — Build Status

Production rebuild of the frozen design prototype (`project/Fennec.dc.html`).
Plan: `~/.claude/plans/analyse-the-full-system-peppy-curry.md`.

## ✅ Done & verified

### Phase 0 — Scaffold (`npm run build` passes)
- Next.js 15 (App Router) + TypeScript strict + Tailwind v4.
- Design tokens ported verbatim from `this.C` → `app/globals.css` (`@theme`).
- Tajawal font via `next/font/google`; animations + responsive sidebar CSS ported.
- Supabase clients: `lib/supabase/{server,client,admin}.ts` (admin is `server-only`).
- `.gitignore`, `.env.example`, logos → `public/assets/`.
- Security headers in `next.config.ts` (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy). Strict CSP deferred to Phase 6.
- i18n dictionary ported from `DICT` → `lib/i18n/dictionary.ts` (tr/L/months/fmtDate).

### Phase 2 — Finance pure layer (**19/19 unit tests green** — `npm test`)
The correctness pillar. Pure, framework-free, injectable `now`, byte-identical to the prototype:
- `lib/finance/money.ts` — `money()`, `num()`
- `lib/finance/period.ts` — `periodRange`, `inPeriod`, `curYM`, `last6Months`
- `lib/finance/invoice.ts` — `invEffStatus` (overdue derived), `invTotal`, `invRemaining`, `isOverdueProject`
- `lib/finance/metrics.ts` — `metrics()` (all 6 KPIs)
- `lib/finance/pipeline.ts` — weighted value, win rate
- `lib/finance/client.ts` — lifetime value, payment history
- `lib/finance/charts.ts` — trend / donut / top-clients / project-returns series
- `lib/seed.ts` — prototype seed data (deterministic IDs), `PROTOTYPE_NOW`
- `tests/unit/finance.test.ts` — parity assertions hand-derived from the seed

### Phase 1 — Schema / RLS / Auth (✅ applied to live DB; RLS proven)
- Supabase project **`Fennec-Management-System`** (`fesycrujoyffvvvdlzuq`, eu-central-1) provisioned.
- `0001_init.sql` — enums, all 12 org-scoped tables, indexes, constraints, append-only `audit_log` — **applied** (all tables RLS-enabled).
- `0002_rls_audit_rpc.sql` — RLS helpers, policies (read = member, delete = manager), audit triggers, `updated_at` triggers, `create_org_and_owner` + `accept_invitation` RPCs — **applied**.
- `0003_harden_function_grants.sql` — locked down trigger fns + privileged RPCs from anon; `search_path` fix (from `get_advisors`).
- **RLS isolation PROVEN** against the live DB (`supabase/tests/rls_isolation.sql`): read isolation, write isolation, and manager/staff delete gating — all 4 tests pass.
- `lib/database.types.ts` generated from the live schema; Supabase clients are now typed.
- Remaining (moves into UI phases): auth signup/org/invite **screens**, atomic payment/retainer/convert **RPCs** (Phase 4), seed-loader for demo data.

## 🟡 In progress / next

## ⬜ Not started
- Phase 3 — Read UI (shell + 6 modules, charts, RTL/LTR). *Can be built against `lib/seed.ts` without live Supabase.*
- Phase 4 — Write UI (modals, Zod, server actions, atomic RPCs, undo, export).
- Phase 5 — Import wizard + roles polish + audit viewer.
- Phase 6 — E2E (Playwright), Sentry, strict CSP, CI/CD, backups + PITR, deploy.

## Commands
| | |
|---|---|
| `npm run dev` | local dev server |
| `npm run build` | production build (✅ passing) |
| `npm test` | finance unit tests (✅ 19/19) |
| `npm run typecheck` | strict type check |

## Next decision point
To run end-to-end with real persistence + auth, a **Supabase project** must be provisioned (project URL + anon key + service-role key into `.env.local`). The Supabase MCP is connected here and can create it on request. Until then, Phase 3 UI can proceed against the seed data.
