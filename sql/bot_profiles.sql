create table public.bot_profiles (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  bot_id uuid null,
  name text not null,
  avatar_url text null,
  role text null,
  active boolean not null default true,
  constraint bot_profiles_pkey primary key (id),
  constraint bot_profiles_bot_fk foreign key (bot_id) references public.bots (id) on delete set null
);

create index if not exists bot_profiles_bot_idx on public.bot_profiles using btree (bot_id);
