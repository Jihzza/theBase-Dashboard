import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { requireSupabase, supabase } from "@/lib/supabase";
import type { LogEntry } from "@/lib/types";

type TodoRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  due_at: string | null;
  project: string | null;
  tags: string[] | null;
};

type CronSnapshot = {
  id: string;
  created_at: string;
};

function fmt(ts?: string | null) {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [cron, setCron] = useState<CronSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [project, setProject] = useState<string>("all");

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") window.location.href = "/login";
      });

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      const sb = requireSupabase();
      const todayStart = startOfToday().toISOString();
      const todayEnd = endOfToday().toISOString();

      const [{ data: logRows, error: logError }, { data: todoRows, error: todoError }, { data: cronRows }] =
        await Promise.all([
          sb.from("logs").select("*").order("finished_at", { ascending: false }).order("created_at", { ascending: false }).limit(50),
          sb
            .from("todos")
            .select("*")
            .gte("due_at", todayStart)
            .lte("due_at", todayEnd)
            .order("due_at", { ascending: true })
            .limit(20),
          sb.from("cron_snapshot").select("id,created_at").order("created_at", { ascending: false }).limit(50),
        ]);

      if (logError) {
        console.warn("Failed to fetch logs:", logError.message);
        setLogs([]);
      } else {
        setLogs((logRows ?? []) as LogEntry[]);
      }

      if (todoError) {
        console.warn("Failed to fetch todos:", todoError.message);
        setTodos([]);
      } else {
        setTodos((todoRows ?? []) as TodoRow[]);
      }

      setCron((cronRows ?? []) as CronSnapshot[]);
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

  const logsToday = useMemo(() => {
    const start = startOfToday();
    const end = endOfToday();
    return logs.filter((l) => {
      const ts = new Date(l.finished_at ?? l.timestamp ?? l.created_at).valueOf();
      return ts >= start.valueOf() && ts <= end.valueOf();
    });
  }, [logs]);

  const overdueTodos = useMemo(() => {
    const now = new Date().valueOf();
    return todos.filter((t) => t.status !== "done" && t.due_at && new Date(t.due_at).valueOf() < now);
  }, [todos]);

  const upcomingLogs = filtered.slice(0, 8);

  return (
    <AppShell>
      <AppLayout title="Dashboard">
        <SectionHeader
          title="Overview"
          subtitle="Today’s tasks, recent logs, and business signals."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Panel title="Tasks due today" subtitle="Personal + bot tasks">
            <div className="text-3xl font-semibold text-ink">
              {loading ? "—" : todos.length}
            </div>
            <div className="mt-2 text-xs text-muted">Due before end of day</div>
          </Panel>
          <Panel title="Logs today" subtitle="Completed work">
            <div className="text-3xl font-semibold text-ink">
              {loading ? "—" : logsToday.length}
            </div>
            <div className="mt-2 text-xs text-muted">Finished today</div>
          </Panel>
          <Panel title="Cron activity" subtitle="Last 24h snapshots">
            <div className="text-3xl font-semibold text-ink">
              {loading ? "—" : cron.length}
            </div>
            <div className="mt-2 text-xs text-muted">Most recent runs</div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Panel title="Today’s tasks" subtitle="Due today">
            {loading ? (
              <div className="text-sm text-muted">Loading…</div>
            ) : todos.length === 0 ? (
              <div className="text-sm text-muted">No tasks due today.</div>
            ) : (
              <div className="grid gap-3">
                {todos.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">{t.title}</div>
                        <div className="mt-1 text-xs text-muted">
                          {t.project ?? "—"} · Due {fmt(t.due_at)}
                        </div>
                      </div>
                      <div className="text-xs text-muted">{t.status}</div>
                    </div>
                    {t.description ? (
                      <div className="mt-2 text-sm text-muted line-clamp-2">{t.description}</div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.priority ? <Chip text={t.priority} /> : null}
                      {(t.tags ?? []).map((tag) => (
                        <Chip key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <div className="grid gap-6">
            <Panel title="Needs attention" subtitle="Overdue items">
              {overdueTodos.length === 0 ? (
                <div className="text-sm text-muted">Nothing overdue. ✅</div>
              ) : (
                <div className="grid gap-3">
                  {overdueTodos.map((t) => (
                    <div key={t.id} className="rounded-xl border border-border bg-surface p-3 text-sm">
                      <div className="font-semibold text-ink">{t.title}</div>
                      <div className="text-xs text-muted">Overdue · {fmt(t.due_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Calendar preview" subtitle="Recent activity blocks">
              {logsToday.length === 0 ? (
                <div className="text-sm text-muted">No logs recorded today.</div>
              ) : (
                <div className="grid gap-2">
                  {logsToday.slice(0, 5).map((l) => (
                    <div key={l.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
                      <div className="font-semibold text-ink">{l.title}</div>
                      <div className="text-xs text-muted">{fmt(l.started_at ?? l.timestamp)} → {fmt(l.finished_at ?? l.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 text-xs text-muted">
                <Link to="/app/calendar" className="underline underline-offset-4 hover:text-ink">
                  Open calendar
                </Link>
              </div>
            </Panel>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Panel title="Recent logs" subtitle="Latest activity">
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
              ) : upcomingLogs.length === 0 ? (
                <div className="p-6 text-sm text-muted">No logs yet.</div>
              ) : (
                <div>
                  {upcomingLogs.map((l) => (
                    <details key={l.id} className="border-b border-border last:border-b-0">
                      <summary className="cursor-pointer list-none grid grid-cols-12 gap-3 px-5 py-4 hover:bg-surfaceAlt">
                        <div className="col-span-4 text-sm text-ink">{fmt(l.finished_at ?? l.timestamp ?? l.created_at)}</div>
                        <div className="col-span-3 text-sm text-muted">{l.project}</div>
                        <div className="col-span-5 text-sm text-ink font-medium">{l.title}</div>
                      </summary>
                      <div className="px-5 pb-5 text-sm text-muted">
                        {l.details ? <p className="mt-2 leading-relaxed">{l.details}</p> : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(l.tags ?? []).map((t: string) => (
                            <Chip key={t} text={t} />
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

          <Panel title="Quick actions" subtitle="Jump to key areas">
            <div className="grid gap-2 text-sm">
              <Link to="/app/docs" className="rounded-xl border border-border bg-surface px-4 py-3 hover-soft">
                New document
              </Link>
              <Link to="/app/todos" className="rounded-xl border border-border bg-surface px-4 py-3 hover-soft">
                View todos
              </Link>
              <Link to="/app/social" className="rounded-xl border border-border bg-surface px-4 py-3 hover-soft">
                Open social feed
              </Link>
              <Link to="/app/messages" className="rounded-xl border border-border bg-surface px-4 py-3 hover-soft">
                Open messages
              </Link>
            </div>
          </Panel>
        </div>
      </AppLayout>
    </AppShell>
  );
}
