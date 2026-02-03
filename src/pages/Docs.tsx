import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { TopNav } from "@/components/TopNav";

function downloadFile(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DocsPage() {
  const [title, setTitle] = useState("Untitled document");
  const [project, setProject] = useState("theBase");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("# New document\n\nWrite here...");

  function insert(snippet: string) {
    setContent((c) => `${c}\n${snippet}`);
  }

  return (
    <AppShell>
      <TopNav title="Docs" />
      <AppLayout title="Docs">
        <SectionHeader
          title="Docs"
          subtitle="Write and export documents. (Docx/PDF export coming next.)"
        />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Panel title="Editor" subtitle="Structured writing for projects.">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Project</span>
                <input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Author</span>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Tags</span>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="comma-separated"
                  className="w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                onClick={() => insert("# Heading 1")}
              >
                H1
              </button>
              <button
                className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                onClick={() => insert("## Heading 2")}
              >
                H2
              </button>
              <button
                className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                onClick={() => insert("- Bullet item")}
              >
                Bullet
              </button>
              <button
                className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                onClick={() => insert("1. Numbered item")}
              >
                Number
              </button>
              <button
                className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft"
                onClick={() => insert("- [ ] Checklist item")}
              >
                Checklist
              </button>
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Content</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[420px] w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
              />
            </label>
          </Panel>

          <Panel title="Export" subtitle="Download your document.">
            <div className="grid gap-3 text-sm text-muted">
              <button
                className="rounded-xl border border-border bg-surface px-4 py-3 text-left hover-soft"
                onClick={() => downloadFile(`${title || "document"}.md`, content, "text/markdown")}
              >
                Export as .md
              </button>
              <button
                className="rounded-xl border border-border bg-surface px-4 py-3 text-left opacity-60"
                disabled
              >
                Export as .pdf (coming soon)
              </button>
              <button
                className="rounded-xl border border-border bg-surface px-4 py-3 text-left opacity-60"
                disabled
              >
                Export as .docx (coming soon)
              </button>
            </div>
            <div className="mt-6 text-xs text-muted">
              Project: {project} · Author: {author || "—"} · Tags: {tags || "—"}
            </div>
          </Panel>
        </div>
      </AppLayout>
    </AppShell>
  );
}
