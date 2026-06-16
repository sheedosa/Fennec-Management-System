-- ════════════════════════════════════════════════════════════════════
-- Security hardening from `get_advisors` (security linter):
--   • set a stable search_path on touch_updated_at
--   • revoke direct REST EXECUTE on trigger functions (they run via triggers)
--   • restrict the privileged join RPCs to authenticated users (not anon)
-- ════════════════════════════════════════════════════════════════════

-- Trigger functions must never be callable directly via the REST API.
alter function touch_updated_at() set search_path = public;
revoke execute on function audit_financial() from public;
revoke execute on function touch_updated_at() from public;

-- Privileged RPCs: authenticated users only, never anon.
revoke execute on function create_org_and_owner(text) from public;
grant  execute on function create_org_and_owner(text) to authenticated;
revoke execute on function accept_invitation(text) from public;
grant  execute on function accept_invitation(text) to authenticated;

-- auth_org_ids() / auth_role_in(uuid) remain executable by PUBLIC: they are
-- referenced inside RLS policy expressions (so the querying role must be able
-- to evaluate them) and only ever return the CALLER's own membership/role —
-- no cross-tenant exposure. The linter's residual WARN on these is by design.
