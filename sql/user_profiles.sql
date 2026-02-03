create table public.user_profiles (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  avatar_url text null,
  role text null,
  private_tasks boolean not null default true,
  constraint user_profiles_pkey primary key (id)
);

create index if not exists user_profiles_name_idx on public.user_profiles using btree (name);
