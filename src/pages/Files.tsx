import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { AppShell } from "@/components/AppShell";
import { TopNav } from "@/components/TopNav";
import { requireSupabase, supabase } from "@/lib/supabase";

type FileRow = {
  id: string;
  created_at: string;
  updated_at: string;
  project: string;
  title: string;
  type: string;
  tags: string[] | null;
  content: string;
  source: string | null;
};

const TYPES = ["note", "idea", "research", "spec"] as const;

export default function FilesPage() {
  const [rows, setRows] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [project, setProject] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const [activeId, setActiveId] = useState<string | null>(null);

  const active = rows.find((r) => r.id === activeId) ?? null;
  const [draft, setDraft] = useState<{ title: string; project: string; type: string; tags: string; content: string }>(
    { title: "", project: "The Base", type: "note", tags: "", content: "" },
  );

  useEffect(() => {
    if (!active) return;
    setDraft({
      title: active.title,
      project: active.project,
      type: active.type,
      tags: (active.tags ?? []).join(", "),
      content: active.content ?? "",
    });
  }, [activeId]);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const sb = requireSupabase();
      const { data, error } = await sb
        .from("files")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(200);

      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows((data as FileRow[]) ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const projects = useMemo(() => {
    const set = new Set(rows.map((r) => r.project).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (project !== "all" && r.project !== project) return false;
      if (type !== "all" && r.type !== type) return false;
      if (!query) return true;
      const hay = [r.title, r.project, r.type, r.content, ...(r.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [rows, q, project, type]);

  async function createNew() {
    setError(null);
    setSaving(true);
    try {
      const sb = requireSupabase();
      const now = new Date().toISOString();
      const { data, error } = await sb
        .from("files")
        .insert({
          title: "Untitled",
          project: "The Base",
          type: "note",
          tags: ["inbox"],
          content: "",
          source: "manual",
          created_at: now,
          updated_at: now,
        })
        .select("*")
        .single();

      if (error) throw error;

      const row = data as FileRow;
      setRows((prev) => [row, ...prev]);
      setActiveId(row.id);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!active) return;
    setError(null);
    setSaving(true);
    try {
      const sb = requireSupabase();
      const tagsArr = draft.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const now = new Date().toISOString();

      const { error } = await sb
        .from("files")
        .update({
          title: draft.title,
          project: draft.project,
          type: draft.type,
          tags: tagsArr.length ? tagsArr : null,
          content: draft.content,
          updated_at: now,
        })
        .eq("id", active.id);

      if (error) throw error;

      setRows((prev) =>
        prev.map((r) =>
          r.id === active.id
            ? {
                ...r,
                title: draft.title,
                project: draft.project,
                type: draft.type,
                tags: tagsArr.length ? tagsArr : null,
                content: draft.content,
                updated_at: now,
              }
            : r,
        ),
      );
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <TopNav title="Files" />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Files</h1>
            <p className="mt-3 text-muted max-w-2xl">
              Notes, ideas, and research documents. (MVP: text stored in Supabase.)
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
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Library
                </div>
                <button
                  type="button"
                  disabled={saving}
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover:text-ink hover:border-[var(--accent-soft)] transition-colors disabled:opacity-50"
                  onClick={createNew}
                >
                  New
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
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

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="all">all types</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {error ? (
                <div className="mt-4 rounded-xl border border-border bg-surfaceAlt p-4 text-sm text-muted">
                  {error}
                </div>
              ) : null}

              <div className="mt-6">
                {loading ? (
                  <div className="text-sm text-muted">Loading…</div>
                ) : filtered.length === 0 ? (
                  <div className="text-sm text-muted">No files yet.</div>
                ) : (
                  <div className="grid gap-2">
                    {filtered.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setActiveId(r.id)}
                        className={
                          "text-left rounded-xl border px-4 py-3 transition-colors " +
                          (r.id === activeId
                            ? "border-[var(--accent-soft)] bg-surfaceAlt"
                            : "border-border hover:border-[var(--accent-soft)]")
                        }
                      >
                        <div className="text-sm font-semibold text-ink truncate">{r.title}</div>
                        <div className="mt-1 text-xs text-muted truncate">
                          {r.project} · {r.type} · {new Date(r.updated_at).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
              {!active ? (
                <div className="text-sm text-muted">
                  Select a file on the left, or create a new one.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                      Editor
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover:text-ink hover:border-[var(--accent-soft)] transition-colors disabled:opacity-50"
                      onClick={save}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-12">
                    <div className="md:col-span-7">
                      <label className="grid gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                          Title
                        </span>
                        <input
                          value={draft.title}
                          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                          className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                        />
                      </label>
                    </div>
                    <div className="md:col-span-5">
                      <label className="grid gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                          Project
                        </span>
                        <input
                          value={draft.project}
                          onChange={(e) => setDraft((d) => ({ ...d, project: e.target.value }))}
                          className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                        />
                      </label>
                    </div>

                    <div className="md:col-span-4">
                      <label className="grid gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                          Type
                        </span>
                        <select
                          value={draft.type}
                          onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                          className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                        >
                          {TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="md:col-span-8">
                      <label className="grid gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                          Tags (comma-separated)
                        </span>
                        <input
                          value={draft.tags}
                          onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                          className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                        />
                      </label>
                    </div>
                  </div>

                  <label className="mt-4 grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                      Content
                    </span>
                    <textarea
                      value={draft.content}
                      onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                      className="min-h-[420px] w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                    />
                  </label>

                  <div className="mt-4 text-xs text-muted">
                    Updated: {new Date(active.updated_at).toLocaleString()} · Source: {active.source ?? "—"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
