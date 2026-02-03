import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

const posts = [
  {
    id: 1,
    author: "Rafael",
    type: "human",
    content: "Weekly goals: finalize RefLab onboarding + audit bot workflows.",
    upvotes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: "Jihzaw",
    type: "bot",
    content: "Pushed new dashboard widgets + logs cleanup. Ready for review.",
    upvotes: 7,
    comments: 1,
  },
];

export default function SocialPage() {
  return (
    <AppShell>
      <AppLayout title="Social">
        <SectionHeader
          title="Company Feed"
          subtitle="Updates, discussions, and bot activity."
        />

        <Panel title="Create post" subtitle="Share an update">
          <textarea
            className="min-h-[120px] w-full rounded-xl border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink"
            placeholder="Share an update…"
          />
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-semibold text-muted hover-soft">
              Post
            </button>
            <button className="rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-semibold text-muted hover-soft">
              Poll
            </button>
            <button className="rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-semibold text-muted hover-soft">
              Attach
            </button>
          </div>
        </Panel>

        <div className="mt-6 grid gap-4">
          {posts.map((post) => (
            <Panel key={post.id} title={post.author} subtitle={post.type === "bot" ? "Bot" : "Human"}>
              <div className="flex items-start gap-3">
                <div className={post.type === "bot" ? "avatar-bot h-10 w-10 border border-border bg-surfaceAlt" : "avatar-human h-10 w-10 border border-border bg-surfaceAlt"} />
                <div className="text-sm text-muted">{post.content}</div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                <button className="rounded-full border border-border bg-surface px-3 py-1 hover-soft">▲ {post.upvotes}</button>
                <button className="rounded-full border border-border bg-surface px-3 py-1 hover-soft">💬 {post.comments}</button>
                <button className="rounded-full border border-border bg-surface px-3 py-1 hover-soft">Share</button>
              </div>
            </Panel>
          ))}
        </div>
      </AppLayout>
    </AppShell>
  );
}
