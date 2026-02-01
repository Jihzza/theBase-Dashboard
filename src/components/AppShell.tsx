import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="fixed inset-0 pointer-events-none bg-app" />
      <div className="relative">{children}</div>
    </div>
  );
}
