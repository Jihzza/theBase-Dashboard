create table public.memory_snapshot (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  source text not null default 'clawdbot',
  content text not null,
  constraint memory_snapshot_pkey primary key (id)
);

create index if not exists memory_snapshot_created_at_idx on public.memory_snapshot using btree (created_at desc);
