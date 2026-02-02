import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 pointer-events-none bg-app" />
      <div className="relative min-h-screen">{children}</div>
    </div>
  );
}
