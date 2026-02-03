create table public.bots (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  owner text null,
  status text not null default 'offline',
  active boolean not null default true,
  constraint bots_pkey primary key (id)
);

create index if not exists bots_name_idx on public.bots using btree (name);
