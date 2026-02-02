create table public.folders (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  parent_id uuid null,
  project text not null,
  constraint folders_pkey primary key (id),
  constraint folders_parent_fk foreign key (parent_id) references public.folders (id) on delete set null
);

create table public.files (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project text not null,
  title text not null,
  type text not null,
  tags text[] null,
  content text not null default '',
  author text not null,
  folder_id uuid null,
  source text null default 'manual',
  constraint files_pkey primary key (id),
  constraint files_folder_fk foreign key (folder_id) references public.folders (id) on delete set null
);

create table public.file_links (
  file_id uuid not null,
  log_id uuid not null,
  created_at timestamptz not null default now(),
  constraint file_links_pkey primary key (file_id, log_id),
  constraint file_links_file_fk foreign key (file_id) references public.files (id) on delete cascade,
  constraint file_links_log_fk foreign key (log_id) references public.logs (id) on delete cascade
);

create index if not exists files_updated_at_idx on public.files using btree (updated_at desc);
create index if not exists files_project_idx on public.files using btree (project);
create index if not exists files_type_idx on public.files using btree (type);
create index if not exists file_links_log_idx on public.file_links using btree (log_id);
