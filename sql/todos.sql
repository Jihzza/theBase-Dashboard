create table public.todos (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project text null,
  title text not null,
  description text null,
  status text not null default 'todo',
  priority text null,
  due_at timestamptz null,
  owner text null,
  assignee text null,
  private boolean not null default true,
  tags text[] null,
  constraint todos_pkey primary key (id)
);

create index if not exists todos_status_idx on public.todos using btree (status);
create index if not exists todos_due_at_idx on public.todos using btree (due_at);
