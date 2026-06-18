-- Private Storage bucket for invoice attachments; path {org_id}/{invoice_id}/{file}.
-- RLS on storage.objects reuses auth_org_ids()/auth_role_in() (read/insert/
-- update = member, delete = manager), gating on the first path segment.
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy invoices_obj_select on storage.objects for select
  using (bucket_id = 'invoices' and (storage.foldername(name))[1]::uuid in (select auth_org_ids()));
create policy invoices_obj_insert on storage.objects for insert
  with check (bucket_id = 'invoices' and (storage.foldername(name))[1]::uuid in (select auth_org_ids()));
create policy invoices_obj_update on storage.objects for update
  using (bucket_id = 'invoices' and (storage.foldername(name))[1]::uuid in (select auth_org_ids()));
create policy invoices_obj_delete on storage.objects for delete
  using (bucket_id = 'invoices' and auth_role_in((storage.foldername(name))[1]::uuid) = 'manager');
