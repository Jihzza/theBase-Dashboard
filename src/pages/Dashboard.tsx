import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { FeatureCard } from "@/components/FeatureCard";
import { SectionHeader } from "@/components/SectionHeader";
import { TopNav } from "@/components/TopNav";
import { requireSupabase, supabase } from "@/lib/supabase";
import type { LogEntry } from "@/lib/types";

function fmt(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [project, setProject] = useState<string>("all");

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Redirect immediately if signed out.
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") window.location.href = "/login";
      });

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      // MVP: read logs directly via Supabase (RLS should protect this).
      const sb = requireSupabase();
      const { data: rows, error } = await sb
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);

      if (error) {
        console.warn("Failed to fetch logs:", error.message);
        setLogs([]);
      } else {
        setLogs((rows ?? []) as LogEntry[]);
      }
      setLoading(false);

      return () => sub.subscription.unsubscribe();
    })();
  }, []);

  const projects = useMemo(() => {
    const set = new Set(logs.map((l) => l.project).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      if (project !== "all" && l.project !== project) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        (l.details ?? "").toLowerCase().includes(q) ||
        (l.tags ?? []).join(" ").toLowerCase().includes(q)
      );
    });
  }, [logs, project, query]);

  return (
    <AppShell>
      <TopNav title="Dashboard" />

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-ink">The Base</h1>
            <p className="mt-3 text-muted max-w-2xl">
              A private command center for tracking what Clawdbot is doing across projects.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Chip text="MVP" />
            <Chip text="Supabase" />
            <Chip text="Netlify" />
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="bg-surface border border-border rounded-2xl p-6 hover-soft">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              Quick links
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                to="/app/info"
                className="text-sm font-semibold text-ink underline underline-offset-4"
              >
                Info
              </Link>
              <Link
                to="/app/cron"
                className="text-sm font-semibold text-ink underline underline-offset-4"
              >
                Cron jobs
              </Link>
              <Link
                to="/app/instructions"
                className="text-sm font-semibold text-ink underline underline-offset-4"
              >
                Instructions
              </Link>
              <Link
                to="/app/memory"
                className="text-sm font-semibold text-ink underline underline-offset-4"
              >
                Memory
              </Link>
              <Link
                to="/app/files"
                className="text-sm font-semibold text-ink underline underline-offset-4"
              >
                Files
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted">
              Everything is reachable from here.
            </p>
          </div>

          <FeatureCard
            title="Agents"
            subtitle="(Coming soon) Separate roles for research, coding, ops, and reporting."
          />
          <FeatureCard
            title="Tasks"
            subtitle="(Coming soon) Assign, track progress, and attach logs to tasks."
          />
        </div>

        <div className="mt-12">
          <SectionHeader label="Activity Log" />

          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-8">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search logs (title, details, tags)…"
                className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
              >
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-surface shadow-soft overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-border text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              <div className="col-span-4">Time</div>
              <div className="col-span-3">Project</div>
              <div className="col-span-5">Title</div>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-muted">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-sm text-muted">
                No logs yet. Once Supabase is wired and ingest is enabled, entries will appear here.
              </div>
            ) : (
              <div>
                {filtered.map((l) => (
                  <details key={l.id} className="border-b border-border last:border-b-0">
                    <summary className="cursor-pointer list-none grid grid-cols-12 gap-3 px-5 py-4 hover:bg-surfaceAlt">
                      <div className="col-span-4 text-sm text-ink">{fmt(l.timestamp)}</div>
                      <div className="col-span-3 text-sm text-muted">{l.project}</div>
                      <div className="col-span-5 text-sm text-ink font-medium">
                        {l.title}
                      </div>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-muted">
                      {l.details ? <p className="mt-2 leading-relaxed">{l.details}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(l.tags ?? []).map((t: string) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-full border border-border bg-surfaceAlt px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {l.links?.length ? (
                        <div className="mt-4 grid gap-2">
                          {l.links.map((href: string) => (
                            <a
                              key={href}
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 hover:text-ink"
                            >
                              {href}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
