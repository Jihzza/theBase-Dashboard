import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

const profiles = [
  { name: "Jihzaw", role: "Core assistant", active: true },
  { name: "DanielBot", role: "Research", active: true },
  { name: "GoncaloBot", role: "Ops", active: false },
];

export default function BotProfilesPage() {
  return (
    <AppShell>
      <AppLayout title="Bot Profiles">
        <SectionHeader
          title="Bot profiles"
          subtitle="Avatars, names, and roles for each bot."
        />

        <Panel title="Profiles" subtitle="Dummy content until profiles table is wired.">
          <div className="grid gap-3 md:grid-cols-2">
            {profiles.map((p) => (
              <div key={p.name} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-border bg-surfaceAlt" />
                  <div>
                    <div className="text-sm font-semibold text-ink">{p.name}</div>
                    <div className="text-xs text-muted">{p.role}</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted">Status: {p.active ? "Active" : "Inactive"}</div>
              </div>
            ))}
          </div>
        </Panel>
      </AppLayout>
    </AppShell>
  );
}
