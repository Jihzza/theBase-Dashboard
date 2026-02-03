import { useEffect, useMemo, useRef, useState } from "react";
import htmlToDocx from "html-to-docx";
import html2pdf from "html2pdf.js";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { requireSupabase, supabase } from "@/lib/supabase";

type DocumentRow = {
  id: string;
  created_at: string;
  updated_at: string;
  project: string;
  title: string;
  tags: string[] | null;
  author: string | null;
  assigned: string[] | null;
  visibility: string;
  content: string;
};

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const editorRef = useRef<HTMLDivElement | null>(null);

  const active = docs.find((d) => d.id === activeId) ?? null;

  const [draft, setDraft] = useState({
    title: "Untitled document",
    project: "theBase",
    author: "",
    tags: "",
    assigned: "",
    visibility: "private",
    content: "<h1>New document</h1><p>Start writing...</p>",
  });

  useEffect(() => {
    if (!active) return;
    setDraft({
      title: active.title,
      project: active.project,
      author: active.author ?? "",
      tags: (active.tags ?? []).join(", "),
      assigned: (active.assigned ?? []).join(", "),
      visibility: active.visibility ?? "private",
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
        .from("documents")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(200);

      if (error) {
        console.warn("Failed to load documents:", error.message);
        setDocs([]);
      } else {
        setDocs((data as DocumentRow[]) ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => {
      const hay = [d.title, d.project, d.author ?? "", (d.tags ?? []).join(" "), d.content]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [docs, query]);

  async function createDoc() {
    setSaving(true);
    try {
      const sb = requireSupabase();
      const now = new Date().toISOString();
      const { data, error } = await sb
        .from("documents")
        .insert({
          title: "Untitled document",
          project: "theBase",
          author: "",
          tags: ["draft"],
          assigned: [],
          visibility: "private",
          content: "<h1>New document</h1><p>Start writing...</p>",
          created_at: now,
          updated_at: now,
        })
        .select("*")
        .single();
      if (error) throw error;
      const row = data as DocumentRow;
      setDocs((prev) => [row, ...prev]);
      setActiveId(row.id);
    } catch (e) {
      console.warn(e);
    } finally {
      setSaving(false);
    }
  }

  async function autosave(next: typeof draft) {
    if (!active) return;
    setSaving(true);
    try {
      const sb = requireSupabase();
      const now = new Date().toISOString();
      const tagsArr = next.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const assignedArr = next.assigned
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { error } = await sb
        .from("documents")
        .update({
          title: next.title,
          project: next.project,
          author: next.author,
          tags: tagsArr.length ? tagsArr : null,
          assigned: assignedArr.length ? assignedArr : null,
          visibility: next.visibility,
          content: next.content,
          updated_at: now,
        })
        .eq("id", active.id);
      if (error) throw error;

      setDocs((prev) =>
        prev.map((d) =>
          d.id === active.id
            ? {
                ...d,
                title: next.title,
                project: next.project,
                author: next.author,
                tags: tagsArr.length ? tagsArr : null,
                assigned: assignedArr.length ? assignedArr : null,
                visibility: next.visibility,
                content: next.content,
                updated_at: now,
              }
            : d,
        ),
      );
    } catch (e) {
      console.warn(e);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!active) return;
      autosave(draft);
    }, 900);
    return () => clearTimeout(handle);
  }, [draft]);

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
  }

  function handleEditorInput() {
    const html = editorRef.current?.innerHTML ?? "";
    setDraft((d) => ({ ...d, content: html }));
  }

  async function exportDocx() {
    const html = `<h1>${draft.title}</h1>${draft.content}`;
    const blob = await htmlToDocx(html);
    downloadBlob(`${draft.title || "document"}.docx`, blob);
  }

  async function exportPdf() {
    const html = `<div><h1>${draft.title}</h1>${draft.content}</div>`;
    const container = document.createElement("div");
    container.innerHTML = html;
    await html2pdf().from(container).set({ filename: `${draft.title || "document"}.pdf` }).save();
  }

  function exportMd() {
    const md = draft.content
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, "# $1\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, "## $1\n")
      .replace(/<li[^>]*>(.*?)<\/li>/g, "- $1\n")
      .replace(/<p[^>]*>(.*?)<\/p>/g, "$1\n");
    downloadBlob(`${draft.title || "document"}.md`, new Blob([md], { type: "text/markdown" }));
  }

  return (
    <AppShell>
      <AppLayout title="Docs">
        <SectionHeader title="Docs" subtitle="Rich-text documents with autosave and export." />

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <Panel
            title="Library"
            subtitle="All documents"
            actions={
              <button
                type="button"
                onClick={createDoc}
                className="rounded-full border border-border bg-surface px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted hover-soft"
              >
                New
              </button>
            }
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs…"
              className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="mt-4 grid gap-2">
              {loading ? (
                <div className="text-sm text-muted">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-muted">No documents yet.</div>
              ) : (
                filtered.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveId(doc.id)}
                    className={
                      "rounded-xl border px-4 py-3 text-left transition-colors " +
                      (doc.id === activeId
                        ? "border-[var(--accent-soft)] bg-surfaceAlt"
                        : "border-border hover-soft")
                    }
                  >
                    <div className="text-sm font-semibold text-ink truncate">{doc.title}</div>
                    <div className="mt-1 text-xs text-muted truncate">
                      {doc.project} · {new Date(doc.updated_at).toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Editor" subtitle={active ? "Autosaving…" : "Select or create a document"}>
            {!active ? (
              <div className="text-sm text-muted">Select a document to start editing.</div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Title</span>
                    <input
                      value={draft.title}
                      onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Project</span>
                    <input
                      value={draft.project}
                      onChange={(e) => setDraft((d) => ({ ...d, project: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Author</span>
                    <input
                      value={draft.author}
                      onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Assigned</span>
                    <input
                      value={draft.assigned}
                      onChange={(e) => setDraft((d) => ({ ...d, assigned: e.target.value }))}
                      placeholder="comma-separated"
                      className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Tags</span>
                    <input
                      value={draft.tags}
                      onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                      placeholder="comma-separated"
                      className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Visibility</span>
                    <select
                      value={draft.visibility}
                      onChange={(e) => setDraft((d) => ({ ...d, visibility: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft" onClick={() => exec("bold")}>Bold</button>
                  <button className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft" onClick={() => exec("italic")}>Italic</button>
                  <button className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft" onClick={() => exec("formatBlock", "H1")}>H1</button>
                  <button className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft" onClick={() => exec("formatBlock", "H2")}>H2</button>
                  <button className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft" onClick={() => exec("insertUnorderedList")}>Bullet</button>
                  <button className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft" onClick={() => exec("insertOrderedList")}>Number</button>
                  <button className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft" onClick={() => exec("insertHTML", "<input type='checkbox'/> ")}>Checklist</button>
                </div>

                <div
                  ref={editorRef}
                  onInput={handleEditorInput}
                  className="min-h-[420px] w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: draft.content }}
                />

                <div className="flex flex-wrap gap-2 text-xs text-muted">
                  <button className="rounded-full border border-border bg-surface px-3 py-2 text-[11px] font-semibold text-muted hover-soft" onClick={exportMd}>Export .md</button>
                  <button className="rounded-full border border-border bg-surface px-3 py-2 text-[11px] font-semibold text-muted hover-soft" onClick={exportPdf}>Export .pdf</button>
                  <button className="rounded-full border border-border bg-surface px-3 py-2 text-[11px] font-semibold text-muted hover-soft" onClick={exportDocx}>Export .docx</button>
                  <span>{saving ? "Saving…" : "Saved"}</span>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </AppLayout>
    </AppShell>
  );
}
