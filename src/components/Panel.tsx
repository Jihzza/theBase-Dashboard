import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 hover-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
