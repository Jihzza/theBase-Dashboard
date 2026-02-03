import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

const metrics = [
  { label: "Runway", value: "8.4 mo", trend: "+0.6" },
  { label: "MRR", value: "€12.4k", trend: "+8%" },
  { label: "Active projects", value: "6", trend: "stable" },
  { label: "Marketing ROI", value: "3.2x", trend: "+0.4" },
];

const alerts = [
  { title: "Invoice aging", detail: "2 invoices > 30 days" },
  { title: "Stalled project", detail: "RefLab onboarding" },
];

export default function HealthPage() {
  return (
    <AppShell>
      <AppLayout title="Business Health">
        <SectionHeader
          title="Business Health"
          subtitle="Saikan-wide KPI snapshot and alerts."
        />

        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((m) => (
            <Panel key={m.label} title={m.label} subtitle={`Trend: ${m.trend}`}>
              <div className="text-2xl font-semibold text-ink">{m.value}</div>
            </Panel>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Panel title="Performance" subtitle="Last 30 days (dummy)">
            <div className="grid gap-3 text-sm text-muted">
              <div>• Revenue growth: +12%</div>
              <div>• Project delivery rate: 84%</div>
              <div>• Marketing pipeline: 28 leads</div>
            </div>
          </Panel>
          <Panel title="Alerts" subtitle="Requires attention">
            {alerts.map((a) => (
              <div key={a.title} className="rounded-xl border border-border bg-surface p-3 text-sm">
                <div className="font-semibold text-ink">{a.title}</div>
                <div className="text-xs text-muted">{a.detail}</div>
              </div>
            ))}
          </Panel>
        </div>
      </AppLayout>
    </AppShell>
  );
}
