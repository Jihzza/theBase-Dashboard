create table public.bot_feed (
  id uuid not null default gen_random_uuid (),
  created_at timestamptz not null default now(),
  bot_id uuid null,
  content text not null,
  tags text[] null,
  source text null default 'bot',
  constraint bot_feed_pkey primary key (id),
  constraint bot_feed_bot_fk foreign key (bot_id) references public.bots (id) on delete set null
);

create index if not exists bot_feed_created_at_idx on public.bot_feed using btree (created_at desc);
