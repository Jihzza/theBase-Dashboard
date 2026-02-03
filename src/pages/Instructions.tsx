import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { requireSupabase, supabase } from "@/lib/supabase";

type InstrRow = {
  id: string;
  project: string;
  category: string;
  content: string;
  updated_at: string;
};

export default function InstructionsPage() {
  const [rows, setRows] = useState<InstrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [project, setProject] = useState<string>("theBase");
  const [category, setCategory] = useState<string>("");
  const projects = useMemo(() => Array.from(new Set(rows.map((r) => r.project))).sort(), [rows]);
  const categories = useMemo(
    () => Array.from(new Set(rows.filter((r) => r.project === project).map((r) => r.category))).sort(),
    [rows, project],
  );
  const current = rows.find((r) => r.project === project && r.category === category);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (current) setContent(current.content ?? "");
  }, [current?.id]);

  useEffect(() => {
    if (!category && categories.length) setCategory(categories[0]);
  }, [categories, category]);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const sb = requireSupabase();
      const { data, error } = await sb
        .from("project_instructions")
        .select("id,project,category,content,updated_at")
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
      <AppLayout title="Instructions">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <Panel title="Project" subtitle="Select which project instructions to edit.">
              {loading ? (
                <div className="text-sm text-muted">Loading…</div>
              ) : (
                <div className="grid gap-3">
                  <select
                    value={project}
                    onChange={(e) => {
                      setProject(e.target.value);
                      setError(null);
                      setCategory("");
                    }}
                    className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                  >
                    {projects.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="rounded-full border border-border bg-surface px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted hover-soft"
                    onClick={async () => {
                      const name = window.prompt("New instruction category?");
                      if (!name) return;
                      try {
                        const sb = requireSupabase();
                        const { data, error } = await sb
                          .from("project_instructions")
                          .insert({ project, category: name, content: "" })
                          .select("*")
                          .single();
                        if (error) throw error;
                        setRows((prev) => [...prev, data as InstrRow]);
                        setCategory(name);
                      } catch (e: any) {
                        setError(e?.message ?? "Failed to create category");
                      }
                    }}
                  >
                    New category
                  </button>
                </div>
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
                      const now = new Date().toISOString();
                      const { error } = await sb
                        .from("project_instructions")
                        .update({ content, updated_at: now })
                        .eq("id", current.id);
                      if (error) throw error;

                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === current.id ? { ...r, content, updated_at: now } : r,
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
