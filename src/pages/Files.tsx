import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
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
  author: string;
  folder_id: string | null;
  source: string | null;
};

type FolderRow = {
  id: string;
  name: string;
  project: string;
  parent_id: string | null;
};

export default function FilesPage() {
  const [rows, setRows] = useState<FileRow[]>([]);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [project, setProject] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");

  const [activeId, setActiveId] = useState<string | null>(null);

  const active = rows.find((r) => r.id === activeId) ?? null;
  const [draft, setDraft] = useState<{
    title: string;
    project: string;
    type: string;
    tags: string;
    content: string;
    author: string;
    folder_id: string | null;
  }>({ title: "", project: "theBase", type: "", tags: "", content: "", author: "", folder_id: null });

  useEffect(() => {
    if (!active) return;
    setDraft({
      title: active.title,
      project: active.project,
      type: active.type,
      tags: (active.tags ?? []).join(", "),
      content: active.content ?? "",
      author: active.author ?? "",
      folder_id: active.folder_id ?? null,
    });
  }, [activeId]);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const sb = requireSupabase();
      const [{ data: files, error: filesError }, { data: folderData, error: foldersError }] = await Promise.all([
        sb.from("files").select("*").order("updated_at", { ascending: false }).limit(200),
        sb.from("folders").select("*").order("name", { ascending: true }).limit(200),
      ]);

      if (filesError || foldersError) {
        setError(filesError?.message ?? foldersError?.message ?? "Failed to load");
        setRows([]);
        setFolders([]);
      } else {
        setRows((files as FileRow[]) ?? []);
        setFolders((folderData as FolderRow[]) ?? []);
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
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (folderFilter !== "all" && r.folder_id !== folderFilter) return false;
      if (!query) return true;
      const hay = [r.title, r.project, r.type, r.content, r.author, ...(r.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [rows, q, project, typeFilter, folderFilter]);

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
          project: "theBase",
          type: "",
          tags: ["inbox"],
          content: "",
          author: "",
          folder_id: null,
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
          author: draft.author,
          folder_id: draft.folder_id,
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
                author: draft.author,
                folder_id: draft.folder_id,
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

  async function createFolder() {
    const name = window.prompt("Folder name?");
    if (!name) return;
    setSaving(true);
    setError(null);
    try {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from("folders")
        .insert({ name, project: project === "all" ? "theBase" : project })
        .select("*")
        .single();
      if (error) throw error;
      setFolders((prev) => [...prev, data as FolderRow]);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create folder");
    } finally {
      setSaving(false);
    }
  }

  async function removeActive() {
    if (!active) return;
    if (!window.confirm("Delete this file?")) return;
    setSaving(true);
    setError(null);
    try {
      const sb = requireSupabase();
      const { error } = await sb.from("files").delete().eq("id", active.id);
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== active.id));
      setActiveId(null);
    } catch (e: any) {
      setError(e?.message ?? "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  function insertFormat(prefix: string, suffix = "") {
    setDraft((d) => ({ ...d, content: `${d.content}${prefix}${suffix}` }));
  }

  return (
    <AppShell>
      <TopNav title="Files" />
      <AppLayout title="Files">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <Panel
              title="Library"
              subtitle="Browse, search, and create documents."
              actions={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover:text-ink hover:border-[var(--accent-soft)] transition-colors disabled:opacity-50"
                    onClick={createNew}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover:text-ink hover:border-[var(--accent-soft)] transition-colors disabled:opacity-50"
                    onClick={createFolder}
                  >
                    Folder
                  </button>
                </div>
              }
            >
              <div className="grid gap-3">
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
                  value={folderFilter}
                  onChange={(e) => setFolderFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="all">all folders</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <input
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  placeholder="Filter by type (free-text)"
                  className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                />
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
                          {r.project} · {r.type || "untitled"} · {new Date(r.updated_at).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          </div>

          <div className="md:col-span-8">
            <Panel
              title="Editor"
              subtitle={
                active
                  ? `Editing: ${active.title}`
                  : "Select a file on the left, or create a new one."
              }
              actions={
                active ? (
                  <button
                    type="button"
                    disabled={saving}
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover:text-ink hover:border-[var(--accent-soft)] transition-colors disabled:opacity-50"
                    onClick={save}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                ) : null
              }
            >
              {!active ? (
                <div className="text-sm text-muted">
                  Select a file on the left, or create a new one.
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-12">
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
                          Type (free text)
                        </span>
                        <input
                          value={draft.type}
                          onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                          className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                        />
                      </label>
                    </div>
                    <div className="md:col-span-4">
                      <label className="grid gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                          Author
                        </span>
                        <input
                          value={draft.author}
                          onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
                          className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                        />
                      </label>
                    </div>
                    <div className="md:col-span-4">
                      <label className="grid gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                          Folder
                        </span>
                        <select
                          value={draft.folder_id ?? ""}
                          onChange={(e) => setDraft((d) => ({ ...d, folder_id: e.target.value || null }))}
                          className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                        >
                          <option value="">No folder</option>
                          {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertFormat("# ")}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat("## ")}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat("- ")}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                    >
                      Bullet
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormat("1. ")}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                    >
                      Number
                    </button>
                  </div>

                  <label className="mt-4 grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                      Content (Markdown)
                    </span>
                    <textarea
                      value={draft.content}
                      onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                      className="min-h-[420px] w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                    />
                  </label>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <div>
                      Updated: {new Date(active.updated_at).toLocaleString()} · Source: {active.source ?? "—"}
                    </div>
                    <button
                      type="button"
                      disabled={saving}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                      onClick={removeActive}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </Panel>
          </div>
        </div>
      </AppLayout>
    </AppShell>
  );
}
