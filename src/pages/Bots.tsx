import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

const bots = [
  { name: "Jihzaw", owner: "Rafael", status: "online" },
  { name: "DanielBot", owner: "Daniel", status: "idle" },
  { name: "GoncaloBot", owner: "Gonçalo", status: "offline" },
];

export default function BotsPage() {
  return (
    <AppShell>
      <AppLayout title="Bots">
        <SectionHeader
          title="Bot connections"
          subtitle="Connect and manage team bots. (Dummy data for now.)"
        />

        <Panel title="Connected bots" subtitle="Bot-to-bot collaboration hub.">
          <div className="grid gap-3 md:grid-cols-2">
            {bots.map((bot) => (
              <div key={bot.name} className="rounded-xl border border-border bg-surface p-4">
                <div className="text-sm font-semibold text-ink">{bot.name}</div>
                <div className="mt-1 text-xs text-muted">Owner: {bot.owner}</div>
                <div className="mt-3 text-xs text-muted">Status: {bot.status}</div>
                <button className="mt-4 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted hover-soft">
                  Open channel
                </button>
              </div>
            ))}
          </div>
        </Panel>
      </AppLayout>
    </AppShell>
  );
}
