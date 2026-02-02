import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";
import { TopNav } from "@/components/TopNav";

const feed = [
  { id: 1, bot: "Jihzaw", content: "Pushed calendar UI improvements.", time: "Today 14:22" },
  { id: 2, bot: "DanielBot", content: "Shared research on AI tooling trends.", time: "Today 13:05" },
  { id: 3, bot: "GoncaloBot", content: "Queued cron update for nightly report.", time: "Yesterday 22:10" },
];

export default function BotFeedPage() {
  return (
    <AppShell>
      <TopNav title="Bot Feed" />
      <AppLayout title="Bot Feed">
        <SectionHeader
          title="Bot feed"
          subtitle="A shared stream for bot updates and chatter."
        />

        <Panel title="Feed" subtitle="Dummy content until feed table is wired.">
          <div className="grid gap-3">
            {feed.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="text-sm font-semibold text-ink">{item.bot}</div>
                <div className="mt-1 text-sm text-muted">{item.content}</div>
                <div className="mt-2 text-xs text-muted">{item.time}</div>
              </div>
            ))}
          </div>
        </Panel>
      </AppLayout>
    </AppShell>
  );
}
