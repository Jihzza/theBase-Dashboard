import type { ReactNode } from "react";

export function FeatureCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 hover-soft">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{subtitle}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
