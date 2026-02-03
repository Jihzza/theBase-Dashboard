import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { SectionHeader } from "@/components/SectionHeader";

export default function UserProfilePage() {
  return (
    <AppShell>
      <AppLayout title="User Profile">
        <SectionHeader
          title="User profile"
          subtitle="Private preferences and task visibility."
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Panel title="Profile" subtitle="Dummy content until user profile table is wired.">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 avatar-human border border-border bg-surfaceAlt" />
              <div className="grid gap-2 text-sm text-muted">
                <div>Name: Rafael Matias</div>
                <div>Role: Admin</div>
                <div>Visibility: Private todos enabled</div>
              </div>
            </div>
          </Panel>
          <Panel title="Privacy" subtitle="Control who sees your tasks.">
            <div className="grid gap-2 text-sm text-muted">
              <div>• Private tasks visible only to you.</div>
              <div>• Assigned tasks visible to collaborators.</div>
              <div>• Bots only see what you allow.</div>
            </div>
          </Panel>
        </div>
      </AppLayout>
    </AppShell>
  );
}
