import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { requireSupabase, supabase } from "@/lib/supabase";
import type { LogEntry } from "@/lib/types";

function pad(v: number) {
  return v.toString().padStart(2, "0");
}

function formatTimestamp(date?: string | null) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.valueOf())) return date;
  return `${pad(d.getHours())}-${pad(d.getMinutes())} ${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export default function LogsPage() {
  const [rows, setRows] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [project, setProject] = useState("all");
  const [status, setStatus] = useState("all");
  const [tag, setTag] = useState("");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [view, setView] = useState<"flat" | "day" | "project">("flat");

  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);

  const [active, setActive] = useState<LogEntry | null>(null);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const sb = requireSupabase();
        let queryBuilder = sb
          .from("logs")
          .select("*", { count: "exact" })
          .order("finished_at", { ascending: false })
          .order("timestamp", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1);

        if (project !== "all") queryBuilder = queryBuilder.eq("project", project);
        if (status !== "all") queryBuilder = queryBuilder.eq("status", status);
        if (tag.trim()) queryBuilder = queryBuilder.contains("tags", [tag.trim()]);
        if (dateFrom) queryBuilder = queryBuilder.gte("finished_at", `${dateFrom}T00:00:00Z`);
        if (dateTo) queryBuilder = queryBuilder.lte("finished_at", `${dateTo}T23:59:59Z`);

        const { data, error, count } = await queryBuilder;
        if (error) throw error;
        setRows((data as LogEntry[]) ?? []);
        setTotal(count ?? null);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load logs");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize, project, status, tag, dateFrom, dateTo]);

  const projects = useMemo(() => {
    const set = new Set(rows.map((r) => r.project).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.title,
        r.details ?? "",
        r.project,
        r.status,
        (r.tags ?? []).join(" "),
        r.source ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    filtered.forEach((r) => {
      const date = r.finished_at ?? r.timestamp ?? r.created_at;
      const d = new Date(date);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const groupedByProject = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    filtered.forEach((r) => {
      const key = r.project || "—";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <AppShell>

      <AppLayout
        title="Logs"
        right={
          <div className="flex flex-wrap items-center gap-2">
            {(["flat", "day", "project"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={
                  view === mode
                    ? "rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
                    : "rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted hover-soft"
                }
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        }
      >
        <SectionHeader
          title="Logs"
          subtitle="All activity logged by Clawdbot and team members."
        />

        <Panel title="Filters" subtitle="Search and refine the log stream.">
          <div className="grid gap-3 md:grid-cols-6">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)] md:col-span-2"
            />
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
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Tag"
              className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="all">all status</option>
              <option value="todo">todo</option>
              <option value="doing">doing</option>
              <option value="done">done</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </Panel>

        <Panel title="Log stream" subtitle={loading ? "Loading…" : `${filtered.length} items`}>
          {error ? <div className="text-sm text-muted">{error}</div> : null}

          {!loading && view === "flat" && (
            <div className="grid gap-3">
              {filtered.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setActive(log)}
                  className="rounded-xl border border-border bg-surface p-4 text-left hover-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-ink">{log.title}</div>
                      <div className="mt-1 text-xs text-muted">{log.project}</div>
                    </div>
                    <div className="text-xs text-muted">
                      {formatTimestamp(log.started_at ?? log.timestamp)} → {formatTimestamp(log.finished_at ?? log.timestamp)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted line-clamp-2">{log.details ?? "No details"}</div>
                  {log.tags && log.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {log.tags.map((t) => (
                        <Chip key={t} text={t} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
              {!filtered.length && <div className="text-sm text-muted">No logs found.</div>}
            </div>
          )}

          {!loading && view === "day" && (
            <div className="grid gap-6">
              {groupedByDay.map(([day, items]) => (
                <div key={day}>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted">{day}</div>
                  <div className="grid gap-3">
                    {items.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => setActive(log)}
                        className="rounded-xl border border-border bg-surface p-4 text-left hover-soft"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-ink">{log.title}</div>
                            <div className="mt-1 text-xs text-muted">{log.project}</div>
                          </div>
                          <div className="text-xs text-muted">
                            {formatTimestamp(log.started_at ?? log.timestamp)} → {formatTimestamp(log.finished_at ?? log.timestamp)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted line-clamp-2">{log.details ?? "No details"}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!groupedByDay.length && <div className="text-sm text-muted">No logs found.</div>}
            </div>
          )}

          {!loading && view === "project" && (
            <div className="grid gap-6">
              {groupedByProject.map(([proj, items]) => (
                <div key={proj}>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted">{proj}</div>
                  <div className="grid gap-3">
                    {items.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => setActive(log)}
                        className="rounded-xl border border-border bg-surface p-4 text-left hover-soft"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-ink">{log.title}</div>
                            <div className="mt-1 text-xs text-muted">{log.project}</div>
                          </div>
                          <div className="text-xs text-muted">
                            {formatTimestamp(log.started_at ?? log.timestamp)} → {formatTimestamp(log.finished_at ?? log.timestamp)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted line-clamp-2">{log.details ?? "No details"}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!groupedByProject.length && <div className="text-sm text-muted">No logs found.</div>}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
            <div>
              Page {page} {total ? `of ${Math.ceil(total / pageSize)}` : ""}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
              >
                {[50, 100, 500].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <button
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted hover-soft"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted hover-soft"
                disabled={total ? page >= Math.ceil(total / pageSize) : false}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </Panel>
      </AppLayout>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-muted">{active.project}</div>
                <h3 className="text-lg font-semibold text-ink">{active.title}</h3>
              </div>
              <button
                onClick={() => setActive(null)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted hover-soft"
              >
                Close
              </button>
            </div>
            <div className="mt-4 text-sm text-muted">{active.details ?? "No additional details provided."}</div>
            <div className="mt-4 grid gap-2 text-xs text-muted">
              <div>
                <span className="font-semibold text-ink">Started:</span> {formatTimestamp(active.started_at ?? active.timestamp)}
              </div>
              <div>
                <span className="font-semibold text-ink">Finished:</span> {formatTimestamp(active.finished_at ?? active.timestamp)}
              </div>
              <div>
                <span className="font-semibold text-ink">Status:</span> {active.status}
              </div>
            </div>
            {active.tags && active.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {active.tags.map((tag) => (
                  <Chip key={tag} text={tag} />
                ))}
              </div>
            )}
            {active.links && active.links.length > 0 && (
              <div className="mt-4 grid gap-2">
                {active.links.map((link) => (
                  <a key={link} href={link} className="text-sm font-semibold text-ink underline underline-offset-4">
                    {link}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
