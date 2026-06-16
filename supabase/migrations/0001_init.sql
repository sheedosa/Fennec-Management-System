-- ════════════════════════════════════════════════════════════════════
-- Fennec Management System — initial schema, RLS, audit, RPCs
-- Multi-tenant by organization; roles Manager / Staff; append-only audit.
-- Money = numeric(14,2); calendar fields = date (unzoned, matching the
-- prototype's NOW comparisons). `overdue` is DERIVED at read, never stored
-- as the source of truth (an advisory cron may persist it for querying).
-- ════════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────────
create type contract_type     as enum ('oneoff', 'retainer');
create type project_status     as enum ('active', 'hold', 'completed', 'cancelled');
create type invoice_status     as enum ('draft', 'sent', 'paid', 'overdue');
create type tx_type            as enum ('revenue', 'cost', 'overhead');
create type overhead_category  as enum ('salaries', 'rent', 'internet', 'operations');
create type lead_stage         as enum ('contact', 'proposal', 'negotiation', 'won', 'lost');
create type lost_reason        as enum ('price', 'timing', 'competitor', 'noresponse', 'other');
create type org_role           as enum ('manager', 'staff');

-- ── Identity / tenancy ───────────────────────────────────────────────
create table organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  locale     text not null default 'ar',
  created_at timestamptz not null default now()
);

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       org_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
create index on memberships (user_id);
create index on memberships (org_id);

create table invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  email       text not null,
  role        org_role not null default 'staff',
  token       text not null unique,
  invited_by  uuid references auth.users(id),
  expires_at  timestamptz not null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);
create index on invitations (org_id);

-- ── Domain tables (all org-scoped, soft-deletable) ───────────────────
create table clients (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  name       text not null,
  contact    text,
  phone      text,
  email      text,
  notes      text,
  created_on date not null default current_date,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on clients (org_id);

create table projects (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  client_id  uuid not null references clients(id),
  name       text not null,
  type       contract_type not null default 'oneoff',
  value      numeric(14,2) not null,
  monthly    numeric(14,2),
  start_date date not null,
  end_date   date not null,
  status     project_status not null default 'active',
  created_on date not null default current_date,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint retainer_needs_monthly check (type <> 'retainer' or monthly is not null)
);
create index on projects (org_id);
create index on projects (org_id, status);
create index on projects (client_id);

create table invoices (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  client_id   uuid not null references clients(id),
  project_id  uuid references projects(id),
  number      text not null,
  issue_date  date not null,
  due_date    date not null,
  status      invoice_status not null default 'draft',
  paid_amount numeric(14,2) not null default 0,
  created_on  date not null default current_date,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, number)
);
create index on invoices (org_id);
create index on invoices (org_id, status);
create index on invoices (org_id, due_date);

create table invoice_items (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  amount     numeric(14,2) not null,
  position   int not null default 0
);
create index on invoice_items (invoice_id);
create index on invoice_items (org_id);

create table transactions (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references organizations(id) on delete cascade,
  type              tx_type not null,
  amount            numeric(14,2) not null,
  project_id        uuid references projects(id),
  overhead_category overhead_category,
  invoice_id        uuid references invoices(id),
  description       text,
  tx_date           date not null,
  retainer_ym       text,
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  constraint overhead_needs_category check (type <> 'overhead' or overhead_category is not null),
  constraint nonoverhead_needs_project check (type = 'overhead' or project_id is not null)
);
create index on transactions (org_id);
create index on transactions (org_id, tx_date);
create index on transactions (org_id, type);
create index on transactions (org_id, retainer_ym);
create index on transactions (project_id);

create table leads (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  client_id   uuid not null references clients(id),
  name        text not null,
  value       numeric(14,2) not null,
  stage       lead_stage not null default 'contact',
  lost_reason lost_reason,
  created_on  date not null default current_date,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint lost_needs_reason check (stage <> 'lost' or lost_reason is not null)
);
create index on leads (org_id);
create index on leads (org_id, stage);

create table fixed_expenses (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  name       text not null,
  amount     numeric(14,2) not null,
  category   overhead_category not null,
  last_gen   text,
  created_on date not null default current_date,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on fixed_expenses (org_id);

create table audit_log (
  id         bigint generated always as identity primary key,
  org_id     uuid not null,
  actor_id   uuid references auth.users(id),
  table_name text not null,
  row_id     uuid not null,
  action     text not null,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz not null default now()
);
create index on audit_log (org_id, table_name, row_id);
