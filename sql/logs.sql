create table public.logs (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  project text not null,
  title text not null,
  details text null,
  status text not null default 'done',
  tags text[] null,
  links text[] null,
  source text null default 'clawdbot',
  constraint logs_pkey primary key (id)
);

create index if not exists logs_started_at_idx on public.logs using btree (started_at desc);
create index if not exists logs_finished_at_idx on public.logs using btree (finished_at desc);
create index if not exists logs_project_idx on public.logs using btree (project);
