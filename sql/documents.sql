create table public.documents (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project text not null,
  title text not null,
  tags text[] null,
  author text null,
  assigned text[] null,
  visibility text not null default 'private',
  content text not null default '',
  source text null default 'manual',
  constraint documents_pkey primary key (id)
);

create index if not exists documents_project_idx on public.documents using btree (project);
create index if not exists documents_updated_at_idx on public.documents using btree (updated_at desc);
