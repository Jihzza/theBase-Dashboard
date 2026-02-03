create table public.cron_snapshot (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  source text not null default 'clawdbot',
  payload jsonb not null,
  constraint cron_snapshot_pkey primary key (id)
);

create index if not exists cron_snapshot_created_at_idx on public.cron_snapshot using btree (created_at desc);
