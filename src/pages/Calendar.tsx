import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { TopNav } from "@/components/TopNav";
import { requireSupabase, supabase } from "@/lib/supabase";
import type { LogEntry } from "@/lib/types";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toLocalDateKey(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function parseLogDate(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.valueOf())) return null;
  return d;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTimestamp(date: Date) {
  return `${pad(date.getHours())}-${pad(date.getMinutes())} ${pad(
    date.getDate(),
  )}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, amount: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function monthGridDates(base: Date) {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const gridStart = startOfWeek(start);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export default function CalendarPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [activeLog, setActiveLog] = useState<LogEntry | null>(null);

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
      const { data: rows, error } = await sb
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(500);

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

  const logsByDay = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    logs.forEach((log) => {
      const d = parseLogDate(log.timestamp);
      if (!d) return;
      const key = toLocalDateKey(d);
      const current = map.get(key) ?? [];
      current.push(log);
      map.set(key, current);
    });
    return map;
  }, [logs]);

  const monthDates = useMemo(() => monthGridDates(selectedDate), [selectedDate]);
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const selectedKey = toLocalDateKey(selectedDate);
  const dayLogs = (logsByDay.get(selectedKey) ?? []).slice().sort((a, b) => {
    return new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf();
  });

  return (
    <AppShell>
      <TopNav title="Calendar" />

      <AppLayout
        title="Calendar"
        right={
          <div className="flex flex-wrap items-center gap-2">
            {(["month", "week", "day"] as const).map((mode) => (
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
          title="Calendar"
          subtitle="Logs grouped by day, week, or month."
        />

        <Panel title="Overview" subtitle={loading ? "Loading logs..." : "Select a day to see activity."}>
          {view === "month" && (
            <div className="grid gap-3">
              <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted">
                {dayLabels.map((d) => (
                  <div key={d} className="text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthDates.map((date) => {
                  const key = toLocalDateKey(date);
                  const isSelected = key === selectedKey;
                  const isToday = key === toLocalDateKey(new Date());
                  const count = (logsByDay.get(key) ?? []).length;
                  const inMonth = date.getMonth() === selectedDate.getMonth();

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(date)}
                      className={
                        "flex aspect-square flex-col rounded-lg border p-2 text-left text-xs transition-colors " +
                        (isSelected
                          ? "border-[var(--accent-soft)] bg-surfaceAlt text-ink"
                          : "border-border bg-surface text-muted hover-soft")
                      }
                    >
                      <span className={inMonth ? "text-[11px] font-semibold" : "text-[11px] text-zinc-500"}>
                        {date.getDate()}
                      </span>
                      {isToday && <span className="mt-1 text-[10px] font-semibold text-ink">Today</span>}
                      {count > 0 && (
                        <span className="mt-auto text-[10px] font-semibold text-ink">
                          {count} log{count === 1 ? "" : "s"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {view === "week" && (
            <div className="grid gap-3">
              <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted">
                {dayLabels.map((d) => (
                  <div key={d} className="text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const key = toLocalDateKey(date);
                  const isSelected = key === selectedKey;
                  const items = logsByDay.get(key) ?? [];

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedDate(date);
                        setView("day");
                      }}
                      className={
                        "flex min-h-[150px] flex-col rounded-lg border p-3 text-left text-xs transition-colors " +
                        (isSelected
                          ? "border-[var(--accent-soft)] bg-surfaceAlt text-ink"
                          : "border-border bg-surface text-muted hover-soft")
                      }
                    >
                      <div className="text-[11px] font-semibold text-ink">{date.getDate()}</div>
                      <div className="mt-2 grid gap-2">
                        {items.slice(0, 3).map((log) => (
                          <div key={log.id} className="rounded-md border border-border bg-surfaceAlt px-2 py-1">
                            <div className="truncate text-[10px] font-semibold text-ink">{log.title}</div>
                            <div className="text-[10px] text-muted">{log.project}</div>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="text-[10px] font-semibold text-muted">+{items.length - 3} more</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {view === "day" && (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{formatDateLabel(selectedDate)}</div>
                  <div className="text-xs text-muted">{dayLogs.length} log{dayLogs.length === 1 ? "" : "s"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted hover-soft"
                    onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                  >
                    Prev
                  </button>
                  <button
                    className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted hover-soft"
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {dayLogs.map((log) => {
                  const d = parseLogDate(log.timestamp);
                  return (
                    <button
                      key={log.id}
                      onClick={() => setActiveLog(log)}
                      className="rounded-xl border border-border bg-surface p-4 text-left hover-soft"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-ink">{log.title}</div>
                        <div className="text-xs text-muted">{d ? formatTime(d) : log.timestamp}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted">{log.project}</div>
                      {log.tags && log.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {log.tags.map((tag) => (
                            <Chip key={tag} text={tag} />
                          ))}
                        </div>
                      )}
                      {log.details && <p className="mt-3 text-sm text-muted">{log.details}</p>}
                    </button>
                  );
                })}
                {!dayLogs.length && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted">
                    No logs for this day yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </Panel>
      </AppLayout>

      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-muted">{activeLog.project}</div>
                <h3 className="text-lg font-semibold text-ink">{activeLog.title}</h3>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted hover-soft"
              >
                Close
              </button>
            </div>
            <div className="mt-4 text-sm text-muted">
              {activeLog.details ?? "No additional details provided."}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-ink">Timestamp:</span>
              <span>
                {parseLogDate(activeLog.timestamp)
                  ? formatTimestamp(parseLogDate(activeLog.timestamp)!)
                  : activeLog.timestamp}
              </span>
            </div>
            {activeLog.tags && activeLog.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeLog.tags.map((tag) => (
                  <Chip key={tag} text={tag} />
                ))}
              </div>
            )}
            {activeLog.links && activeLog.links.length > 0 && (
              <div className="mt-4 grid gap-2">
                {activeLog.links.map((link) => (
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
