export function SectionHeader({
  label,
  title,
  subtitle,
}: {
  label?: string;
  title?: string;
  subtitle?: string;
}) {
  if (title) {
    return (
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.3em] text-muted">{label ?? "Section"}</div>
        <h2 className="mt-2 text-2xl font-semibold text-ink">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 mb-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
        {label}
      </h2>
      <div className="h-px flex-grow bg-border" />
    </div>
  );
}
