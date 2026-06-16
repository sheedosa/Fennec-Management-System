-- Per-org theme preference (mirrors the locale column). Drives the cinematic
-- dual-theme system; cached in a `theme` cookie for no-flash SSR.
alter table organizations
  add column if not exists theme text not null default 'dark'
  check (theme in ('light','dark','system'));
