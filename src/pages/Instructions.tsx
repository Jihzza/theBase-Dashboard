import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { AppShell } from "@/components/AppShell";
import { TopNav } from "@/components/TopNav";
import { requireSupabase, supabase } from "@/lib/supabase";

type InstrRow = {
  id: string;
  project: string;
  content: string;
  updated_at: string;
};

export default function InstructionsPage() {
  const [rows, setRows] = useState<InstrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projects = useMemo(() => rows.map((r) => r.project).sort(), [rows]);
  const [project, setProject] = useState<string>("The Base");
  const current = rows.find((r) => r.project === project);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (current) setContent(current.content ?? "");
  }, [current?.id]);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const sb = requireSupabase();
      const { data, error } = await sb
        .from("project_instructions")
        .select("id,project,content,updated_at")
        .order("project", { ascending: true });

      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows((data as InstrRow[]) ?? []);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell>
      <TopNav title="Instructions" />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Instructions</h1>
            <p className="mt-3 text-muted max-w-2xl">
              Per-project instructions that Clawdbot must follow.
            </p>
          </div>
          <div className="hidden md:block">
            <AppNav />
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <AppNav />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Project
              </div>
              {loading ? (
                <div className="mt-4 text-sm text-muted">Loading…</div>
              ) : (
                <select
                  value={project}
                  onChange={(e) => {
                    setProject(e.target.value);
                    setError(null);
                  }}
                  className="mt-3 w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                >
                  {projects.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}

              <div className="mt-6 text-xs text-muted">
                Last updated: {current ? new Date(current.updated_at).toLocaleString() : "—"}
              </div>
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Instructions
                </div>
                <button
                  type="button"
                  disabled={!current || saving}
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover:text-ink hover:border-[var(--accent-soft)] transition-colors disabled:opacity-50"
                  onClick={async () => {
                    if (!current) return;
                    setSaving(true);
                    setError(null);
                    try {
                      const sb = requireSupabase();
                      const { error } = await sb
                        .from("project_instructions")
                        .update({ content, updated_at: new Date().toISOString() })
                        .eq("id", current.id);
                      if (error) throw error;

                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === current.id
                            ? { ...r, content, updated_at: new Date().toISOString() }
                            : r,
                        ),
                      );
                    } catch (e: any) {
                      setError(e?.message ?? "Save failed");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-border bg-surfaceAlt p-4 text-sm text-muted">
                  {error}
                </div>
              ) : null}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write instructions for this project…"
                className="mt-4 min-h-[360px] w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
