import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
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
      <AppLayout title="Instructions">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <Panel title="Project" subtitle="Select which project instructions to edit.">
              {loading ? (
                <div className="text-sm text-muted">Loading…</div>
              ) : (
                <select
                  value={project}
                  onChange={(e) => {
                    setProject(e.target.value);
                    setError(null);
                  }}
                  className="mt-1 w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                >
                  {projects.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              )}

              <div className="mt-4 text-xs text-muted">
                Last updated: {current ? new Date(current.updated_at).toLocaleString() : "—"}
              </div>
            </Panel>
          </div>

          <div className="md:col-span-8">
            <Panel
              title="Instructions"
              subtitle="Clawdbot should read and follow these before doing work."
              actions={
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
              }
            >
              {error ? (
                <div className="rounded-xl border border-border bg-surfaceAlt p-4 text-sm text-muted">
                  {error}
                </div>
              ) : null}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write instructions for this project…"
                className="mt-4 min-h-[420px] w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
              />
            </Panel>
          </div>
        </div>
      </AppLayout>
    </AppShell>
  );
}
