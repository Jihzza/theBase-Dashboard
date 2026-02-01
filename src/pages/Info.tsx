import { AppShell } from "@/components/AppShell";
import { AppNav } from "@/components/AppNav";
import { FeatureCard } from "@/components/FeatureCard";
import { TopNav } from "@/components/TopNav";

export default function InfoPage() {
  return (
    <AppShell>
      <TopNav title="Info" />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Info</h1>
            <p className="mt-3 text-muted max-w-2xl">
              Operational info about Clawdbot, models, and assignments.
            </p>
          </div>
          <div className="hidden md:block">
            <AppNav />
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <AppNav />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
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

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Notes
          </div>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            This page will show live runtime details (agent id, host, default model, overrides) by
            ingesting snapshots from Clawdbot.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
