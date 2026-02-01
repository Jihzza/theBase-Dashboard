export function SectionHeader({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex items-center gap-6 mb-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
        {label}
      </h2>
      <div className="h-px flex-grow bg-border" />
    </div>
  );
}
