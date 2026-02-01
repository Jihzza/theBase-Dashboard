import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { FeatureCard } from "@/components/FeatureCard";
import { Panel } from "@/components/Panel";
import { TopNav } from "@/components/TopNav";

export default function InfoPage() {
  return (
    <AppShell>
      <TopNav title="Info" />
      <AppLayout title="Info">
        <Panel
          title="About Clawdbot"
          subtitle="Operational info about models, roles, and environment."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              title="Agent"
              subtitle="(MVP) Static placeholders; will sync live status later."
            />
            <FeatureCard
              title="Models"
              subtitle="(Coming soon) Default model, role-based overrides, cost/time stats."
            />
            <FeatureCard
              title="Tooling"
              subtitle="(Coming soon) Channels enabled, skills installed, environment info."
            />
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-surfaceAlt p-5 text-sm text-muted">
            This page will show live runtime details by ingesting snapshots from Clawdbot.
          </div>
        </Panel>
      </AppLayout>
    </AppShell>
  );
}
