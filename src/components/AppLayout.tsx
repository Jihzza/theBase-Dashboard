import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SidebarNav } from "@/components/SidebarNav";

export function AppLayout({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("thebase.sidebar");
    if (stored) setCollapsed(stored === "collapsed");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("thebase.sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  return (
    <div className="relative z-10 min-h-screen">
      <aside
        className={
          "fixed left-0 top-0 h-screen border-r border-border bg-surface/90 backdrop-blur-lg transition-all " +
          (collapsed ? "w-20" : "w-64")
        }
      >
        <div className="flex h-full flex-col gap-6 px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surfaceAlt text-sm font-bold text-[var(--accent-ink)]">
                TB
              </div>
              {!collapsed ? (
                <div>
                  <div className="text-sm font-semibold text-ink">The Base</div>
                  <div className="text-[11px] text-muted">{title}</div>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={toggle}
              className="rounded-full border border-border bg-surface px-2 py-1 text-xs text-muted hover-soft"
            >
              {collapsed ? "»" : "«"}
            </button>
          </div>

          <SidebarNav collapsed={collapsed} />

          <div className="mt-auto rounded-2xl border border-border bg-surfaceAlt p-3 text-[11px] text-muted">
            {!collapsed ? (
              <div>
                <div className="font-semibold text-ink">Workspace</div>
                <div>Central dashboard</div>
              </div>
            ) : (
              <div className="text-center">•</div>
            )}
          </div>
        </div>
      </aside>

      <main
        className={
          "transition-all " +
          (collapsed ? "pl-20" : "pl-64")
        }
      >
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-20">
          {right ? <div className="mb-6">{right}</div> : null}
          {children}
        </div>
      </main>
    </div>
  );
}
