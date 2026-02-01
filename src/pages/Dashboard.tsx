import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
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

      <AppLayout
        title="Dashboard"
        right={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Panel title="Quick links" subtitle="Jump to key areas.">
              <div className="grid gap-2">
                <Link to="/app/files" className="text-sm font-semibold text-ink underline underline-offset-4">
                  Files
                </Link>
                <Link to="/app/instructions" className="text-sm font-semibold text-ink underline underline-offset-4">
                  Instructions
                </Link>
                <Link to="/app/cron" className="text-sm font-semibold text-ink underline underline-offset-4">
                  Cron
                </Link>
                <Link to="/app/memory" className="text-sm font-semibold text-ink underline underline-offset-4">
                  Memory
                </Link>
                <Link to="/app/info" className="text-sm font-semibold text-ink underline underline-offset-4">
                  Info
                </Link>
              </div>
            </Panel>

            <Panel title="Agents" subtitle="(Coming soon) Role-based bots per team member." >
              <p className="text-sm text-muted">Profiles, tool scopes, and permissions.</p>
            </Panel>

            <Panel title="Tasks" subtitle="(Coming soon) Track work step-by-step." >
              <p className="text-sm text-muted">Attach logs, files, and outcomes.</p>
            </Panel>
          </div>
        }
      >
        <Panel
          title="Activity log"
          subtitle="Search and filter the latest work entries."
        >
          <SectionHeader label="Filters" />

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
        </Panel>
      </AppLayout>
    </AppShell>
  );
}
