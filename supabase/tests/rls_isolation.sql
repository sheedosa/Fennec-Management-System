-- ════════════════════════════════════════════════════════════════════
-- RLS tenant-isolation + role-gating proof.
-- Run against any Fennec database (local `supabase db execute` or the
-- MCP execute_sql). Raises an exception if any guarantee is violated and
-- cleans up all test rows, so it leaves no residue. A clean run = pass.
--
-- Verified PASSING against project fesycrujoyffvvvdlzuq on 2026-06-16.
-- ════════════════════════════════════════════════════════════════════
do $$
declare
  u1 uuid := gen_random_uuid();  -- manager, Org A
  u2 uuid := gen_random_uuid();  -- manager, Org B
  u3 uuid := gen_random_uuid();  -- staff,   Org A
  oa uuid; ob uuid; ca uuid; cb uuid;
  cnt int; rc int;
begin
  -- setup (as postgres)
  insert into auth.users (id, instance_id, aud, role, email) values
    (u1,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','a@test.local'),
    (u2,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','b@test.local'),
    (u3,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','c@test.local');
  insert into organizations(name) values ('Org A') returning id into oa;
  insert into organizations(name) values ('Org B') returning id into ob;
  insert into memberships(org_id,user_id,role) values (oa,u1,'manager'),(ob,u2,'manager'),(oa,u3,'staff');
  insert into clients(org_id,name) values (oa,'A-client') returning id into ca;
  insert into clients(org_id,name) values (ob,'B-client') returning id into cb;

  -- TEST 1: read isolation — u1 (Org A) sees only Org A
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub',u1,'role','authenticated')::text, true);
  select count(*) into cnt from clients;
  if cnt <> 1 then raise exception 'TEST1 FAIL: u1 sees % clients (expected 1)', cnt; end if;
  if exists(select 1 from clients where name='B-client') then raise exception 'TEST1 LEAK: u1 can see Org B client'; end if;

  -- TEST 2: write isolation — u1 cannot insert into Org B
  begin
    insert into clients(org_id,name) values (ob,'hack');
    raise exception 'TEST2 FAIL: u1 inserted a row into Org B';
  exception when insufficient_privilege or check_violation then null; -- expected
  end;

  -- TEST 3: role gating — staff u3 cannot delete
  reset role; set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub',u3,'role','authenticated')::text, true);
  delete from clients where id = ca; get diagnostics rc = row_count;
  if rc <> 0 then raise exception 'TEST3 FAIL: staff deleted % rows (expected 0)', rc; end if;

  -- TEST 4: role gating — manager u1 CAN delete
  reset role; set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub',u1,'role','authenticated')::text, true);
  delete from clients where id = ca; get diagnostics rc = row_count;
  if rc <> 1 then raise exception 'TEST4 FAIL: manager deleted % rows (expected 1)', rc; end if;

  -- cleanup
  reset role;
  delete from auth.users where id in (u1,u2,u3);
  delete from organizations where id in (oa,ob);
  raise notice 'RLS ISOLATION + ROLE GATING: ALL 4 TESTS PASSED';
end $$;
