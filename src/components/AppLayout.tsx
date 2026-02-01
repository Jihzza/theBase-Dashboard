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
  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16">
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-24">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
              {title}
            </div>
            <div className="mt-4">
              <SidebarNav />
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9">
          {right ? <div className="mb-6">{right}</div> : null}
          {children}
        </section>
      </div>
    </div>
  );
}
