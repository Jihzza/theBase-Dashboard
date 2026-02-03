alter table public.documents
  add column if not exists assigned text[] null,
  add column if not exists visibility text not null default 'private';
