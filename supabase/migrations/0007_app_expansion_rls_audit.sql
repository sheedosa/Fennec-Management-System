-- RLS + audit + updated_at for the new tables, following 0002 conventions.
alter table project_tasks    enable row level security;
alter table capital_assets   enable row level security;
alter table employees        enable row level security;
alter table calendar_events  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['project_tasks','capital_assets','employees','calendar_events']
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

-- Financial entities are audited; operational ones (tasks, events) are not.
create trigger audit_capital_assets after insert or update or delete on capital_assets for each row execute function audit_financial();
create trigger audit_employees      after insert or update or delete on employees      for each row execute function audit_financial();

create trigger touch_project_tasks   before update on project_tasks   for each row execute function touch_updated_at();
create trigger touch_capital_assets  before update on capital_assets  for each row execute function touch_updated_at();
create trigger touch_employees       before update on employees       for each row execute function touch_updated_at();
create trigger touch_calendar_events before update on calendar_events for each row execute function touch_updated_at();
