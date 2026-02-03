import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

const seed = [
  {
    id: "1",
    title: "Review calendar UI",
    description: "Check day view block styling and adjust spacing.",
    status: "todo",
    priority: "high",
    assignee: "Rafael",
    due: "2026-02-03",
    project: "theBase",
    tags: ["ui", "review"],
  },
  {
    id: "2",
    title: "Research doc export libraries",
    description: "Compare docx/pdf export options for frontend.",
    status: "doing",
    priority: "medium",
    assignee: "Jihzaw",
    due: "2026-02-04",
    project: "theBase",
    tags: ["research"],
  },
];

export default function TodosPage() {
  const [items, setItems] = useState(seed);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t)),
    );
  }

  return (
    <AppShell>
      <AppLayout title="Todos">
        <SectionHeader
          title="Todos"
          subtitle="Personal and assigned tasks. (Dummy data until DB is wired.)"
        />

        <Panel title="Task list" subtitle={`${items.length} items`}>
          <div className="grid gap-3">
            {items.map((task) => (
              <button
                key={task.id}
                className="rounded-xl border border-border bg-surface p-4 text-left hover-soft"
                onClick={() => toggle(task.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{task.title}</div>
                    <div className="mt-1 text-xs text-muted">{task.project} · Due {task.due}</div>
                  </div>
                  <div className="text-xs text-muted">{task.status.toUpperCase()}</div>
                </div>
                <div className="mt-2 text-sm text-muted">{task.description}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip text={task.priority} />
                  <Chip text={task.assignee} />
                  {task.tags.map((t) => (
                    <Chip key={t} text={t} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </AppLayout>
    </AppShell>
  );
}
