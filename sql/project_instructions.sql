create table public.project_instructions (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project text not null,
  category text not null,
  content text not null default '',
  constraint project_instructions_pkey primary key (id)
);

create index if not exists project_instructions_project_idx on public.project_instructions using btree (project);
create index if not exists project_instructions_category_idx on public.project_instructions using btree (category);
