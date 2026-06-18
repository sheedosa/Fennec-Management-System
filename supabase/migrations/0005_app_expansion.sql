-- Owner-meeting expansion: project tasks, company capital assets, employees
-- (salaries), and calendar events. All org-scoped + soft-delete + updated_at,
-- mirroring 0001_init.sql conventions.

create type asset_type as enum ('cash','equipment','investment','receivable','other');
create type event_type as enum ('shoot','meeting','deadline','delivery','other');

create table project_tasks (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  title      text not null,
  done       boolean not null default false,
  due_date   date,
  position   int not null default 0,
  created_on date not null default current_date,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on project_tasks (org_id);
create index on project_tasks (project_id);
create index on project_tasks (org_id, due_date);

create table capital_assets (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  type        asset_type not null default 'other',
  value       numeric(14,2) not null,
  acquired_on date,
  notes       text,
  created_on  date not null default current_date,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on capital_assets (org_id);
create index on capital_assets (org_id, type);

create table employees (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  name           text not null,
  role           text,
  monthly_salary numeric(14,2) not null,
  active         boolean not null default true,
  start_date     date,
  last_salary_ym text,
  created_on     date not null default current_date,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on employees (org_id);
create index on employees (org_id, active);

create table calendar_events (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references organizations(id) on delete cascade,
  title                 text not null,
  type                  event_type not null default 'other',
  starts_at             timestamptz not null,
  ends_at               timestamptz,
  all_day               boolean not null default false,
  location              text,
  project_id            uuid references projects(id) on delete set null,
  client_id             uuid references clients(id) on delete set null,
  notes                 text,
  remind_minutes_before int,
  created_on            date not null default current_date,
  deleted_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index on calendar_events (org_id);
create index on calendar_events (org_id, starts_at);
create index on calendar_events (project_id);
create index on calendar_events (client_id);
