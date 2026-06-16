-- ════════════════════════════════════════════════════════════════════
-- RLS helper functions, policies, audit triggers, and join RPCs.
-- Read = any org member. Delete on financial tables = manager only.
-- Audit = database trigger (cannot be bypassed by app code paths).
-- ════════════════════════════════════════════════════════════════════

-- ── Helper functions (SECURITY DEFINER avoids recursive policy lookups) ─
create or replace function auth_org_ids()
  returns setof uuid
  language sql security definer stable
  set search_path = public
as $$
  select org_id from memberships where user_id = auth.uid();
$$;

create or replace function auth_role_in(target_org uuid)
  returns org_role
  language sql security definer stable
  set search_path = public
as $$
  select role from memberships where user_id = auth.uid() and org_id = target_org;
$$;

-- ── Enable RLS everywhere ────────────────────────────────────────────
alter table organizations  enable row level security;
alter table profiles        enable row level security;
alter table memberships     enable row level security;
alter table invitations     enable row level security;
alter table clients         enable row level security;
alter table projects        enable row level security;
alter table invoices        enable row level security;
alter table invoice_items   enable row level security;
alter table transactions    enable row level security;
alter table leads           enable row level security;
alter table fixed_expenses  enable row level security;
alter table audit_log       enable row level security;

-- ── profiles: a user manages their own profile ───────────────────────
create policy profiles_self on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- ── organizations: members read; managers update ────────────────────
create policy orgs_select on organizations
  for select using (id in (select auth_org_ids()));
create policy orgs_update on organizations
  for update using (auth_role_in(id) = 'manager') with check (auth_role_in(id) = 'manager');

-- ── memberships: read your orgs' memberships; managers manage them ───
create policy memberships_select on memberships
  for select using (org_id in (select auth_org_ids()));
create policy memberships_insert on memberships
  for insert with check (auth_role_in(org_id) = 'manager');
create policy memberships_update on memberships
  for update using (auth_role_in(org_id) = 'manager') with check (auth_role_in(org_id) = 'manager');
create policy memberships_delete on memberships
  for delete using (auth_role_in(org_id) = 'manager');

-- ── invitations: managers manage ────────────────────────────────────
create policy invitations_select on invitations
  for select using (auth_role_in(org_id) = 'manager');
create policy invitations_insert on invitations
  for insert with check (auth_role_in(org_id) = 'manager');
create policy invitations_delete on invitations
  for delete using (auth_role_in(org_id) = 'manager');

-- ── Generic org-scoped policies for domain tables ───────────────────
--   read   : any member
--   insert : any member (day-to-day entry)
--   update : any member
--   delete : manager only (financial records are recoverable, not casual)
do $$
declare t text;
begin
  foreach t in array array[
    'clients','projects','invoices','invoice_items','transactions','leads','fixed_expenses'
  ]
  loop
    execute format($f$
      create policy %1$s_select on %1$s for select
        using (org_id in (select auth_org_ids()));
      create policy %1$s_insert on %1$s for insert
        with check (org_id in (select auth_org_ids()));
      create policy %1$s_update on %1$s for update
        using (org_id in (select auth_org_ids()))
        with check (org_id in (select auth_org_ids()));
      create policy %1$s_delete on %1$s for delete
        using (auth_role_in(org_id) = 'manager');
    $f$, t);
  end loop;
end $$;

-- ── audit_log: managers read their org's log; nobody writes directly ─
create policy audit_select on audit_log
  for select using (auth_role_in(org_id) = 'manager');
-- (no insert/update/delete policies: only the SECURITY DEFINER trigger writes)

-- ── Audit trigger: append-only capture of financial mutations ────────
create or replace function audit_financial()
  returns trigger
  language plpgsql security definer
  set search_path = public
as $$
declare v_org uuid;
begin
  v_org := coalesce(new.org_id, old.org_id);
  insert into audit_log (org_id, actor_id, table_name, row_id, action, old_data, new_data)
  values (
    v_org, auth.uid(), tg_table_name,
    coalesce(new.id, old.id), tg_op,
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

create trigger audit_invoices       after insert or update or delete on invoices       for each row execute function audit_financial();
create trigger audit_invoice_items  after insert or update or delete on invoice_items  for each row execute function audit_financial();
create trigger audit_transactions   after insert or update or delete on transactions   for each row execute function audit_financial();
create trigger audit_projects       after insert or update or delete on projects       for each row execute function audit_financial();
create trigger audit_fixed_expenses after insert or update or delete on fixed_expenses  for each row execute function audit_financial();

-- ── updated_at maintenance ───────────────────────────────────────────
create or replace function touch_updated_at()
  returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger touch_clients        before update on clients        for each row execute function touch_updated_at();
create trigger touch_projects       before update on projects       for each row execute function touch_updated_at();
create trigger touch_invoices       before update on invoices       for each row execute function touch_updated_at();
create trigger touch_leads          before update on leads          for each row execute function touch_updated_at();
create trigger touch_fixed_expenses before update on fixed_expenses for each row execute function touch_updated_at();

-- ── Join RPCs ────────────────────────────────────────────────────────
-- First signup: create org + manager membership atomically.
create or replace function create_org_and_owner(org_name text)
  returns uuid
  language plpgsql security definer
  set search_path = public
as $$
declare new_org uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into organizations (name) values (org_name) returning id into new_org;
  insert into memberships (org_id, user_id, role) values (new_org, auth.uid(), 'manager');
  return new_org;
end $$;

-- Invited user joins by token.
create or replace function accept_invitation(invite_token text)
  returns uuid
  language plpgsql security definer
  set search_path = public
as $$
declare inv invitations;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into inv from invitations
    where token = invite_token and accepted_at is null and expires_at > now();
  if inv.id is null then raise exception 'invalid or expired invitation'; end if;
  insert into memberships (org_id, user_id, role)
    values (inv.org_id, auth.uid(), inv.role)
    on conflict (org_id, user_id) do nothing;
  update invitations set accepted_at = now() where id = inv.id;
  return inv.org_id;
end $$;
