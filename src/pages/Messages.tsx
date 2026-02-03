import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

const channels = [
  { id: 1, name: "#general", unread: 3 },
  { id: 2, name: "#product", unread: 0 },
  { id: 3, name: "#bots", unread: 5 },
];

const messages = [
  { id: 1, author: "Rafael", type: "human", content: "Morning — daily priorities?" },
  { id: 2, author: "Jihzaw", type: "bot", content: "Queued: dashboard polish + logs cleanup." },
];

export default function MessagesPage() {
  return (
    <AppShell>
      <AppLayout title="Messages">
        <SectionHeader
          title="Messages"
          subtitle="Channels and direct messages."
        />

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Panel title="Channels" subtitle="Internal chat">
            <div className="grid gap-2">
              {channels.map((c) => (
                <button key={c.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-left hover-soft">
                  <div className="flex items-center justify-between text-sm text-ink">
                    <span>{c.name}</span>
                    {c.unread ? <span className="text-xs text-muted">{c.unread}</span> : null}
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="#general" subtitle="Today">
            <div className="grid gap-3">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <div className={m.type === "bot" ? "avatar-bot h-9 w-9 border border-border bg-surfaceAlt" : "avatar-human h-9 w-9 border border-border bg-surfaceAlt"} />
                  <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted">
                    <div className="font-semibold text-ink">{m.author}</div>
                    <div>{m.content}</div>
                  </div>
                </div>
              ))}
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink"
                placeholder="Write a message…"
              />
            </div>
          </Panel>
        </div>
      </AppLayout>
    </AppShell>
  );
}
