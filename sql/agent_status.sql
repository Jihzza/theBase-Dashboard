create table public.agent_status (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  state text not null,
  note text null,
  constraint agent_status_pkey primary key (id),
  constraint agent_status_state_check check (state in ('working','idle'))
);

create index if not exists agent_status_updated_at_idx on public.agent_status using btree (updated_at desc);
