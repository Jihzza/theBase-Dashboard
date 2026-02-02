import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { TopNav } from "@/components/TopNav";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  return (
    <AppShell>
      <TopNav title="Calendar" />

      <AppLayout title="Calendar">
        <SectionHeader
          title="Calendar"
          subtitle="Monthly overview and upcoming items (coming soon)."
        />

        <Panel title="This month" subtitle="Preview layout — events integration next.">
          <div className="grid gap-3">
            <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted">
              {days.map((d) => (
                <div key={d} className="text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border border-border bg-surface p-2 text-xs text-muted"
                >
                  <div className="text-[11px] font-semibold text-ink">{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Upcoming" subtitle="Next 7 days">
            <p className="text-sm text-muted">No events connected yet.</p>
          </Panel>
          <Panel title="Notes" subtitle="Planning & focus">
            <p className="text-sm text-muted">Add calendar data source to populate this view.</p>
          </Panel>
        </div>
      </AppLayout>
    </AppShell>
  );
}
