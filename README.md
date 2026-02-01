# The Base (Dashboard)

A private dashboard for logging what Clawdbot is doing.

## Stack
- React + TypeScript (Vite)
- TailwindCSS
- Supabase (Auth + Postgres)
- Netlify (hosting + Functions)

## Environment variables
Copy `.env.example` → `.env` for local dev.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server-side (Netlify Functions env vars):
- `SUPABASE_SERVICE_ROLE_KEY` (never expose to the browser)
- `THEBASE_INGEST_SECRET`

## Local dev
```bash
npm install
npm run dev
```

## Netlify deploy
Netlify will run `npm run build` and publish `dist/`.

## Supabase schema (MVP)
Create a `logs` table with RLS enabled.

Recommended columns:
- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `timestamp timestamptz not null default now()`
- `project text not null`
- `title text not null`
- `details text`
- `status text` (e.g. todo/doing/done)
- `tags text[]`
- `links text[]`
- `source text` (agent/tool/manual)

RLS suggestion (simple): allow authenticated users to read everything, but only allow inserts via the server ingest function.

