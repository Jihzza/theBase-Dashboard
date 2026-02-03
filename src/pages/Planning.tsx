import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

const lanes = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
];

const cards = {
  todo: [
    { id: 1, title: "Launch RefLab MVP" },
    { id: 2, title: "Audit onboarding flow" },
  ],
  doing: [
    { id: 3, title: "Design bot feed layout" },
  ],
  done: [
    { id: 4, title: "Fix logs timestamp" },
  ],
};

export default function PlanningPage() {
  return (
    <AppShell>
      <AppLayout title="Planning">
        <SectionHeader
          title="Planning"
          subtitle="Visual workflow for humans and bots."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {lanes.map((lane) => (
            <Panel key={lane.id} title={lane.title} subtitle="Kanban lane">
              <div className="grid gap-2">
                {cards[lane.id as keyof typeof cards].map((card) => (
                  <div key={card.id} className="rounded-xl border border-border bg-surface p-3 text-sm text-ink">
                    {card.title}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </AppLayout>
    </AppShell>
  );
}
