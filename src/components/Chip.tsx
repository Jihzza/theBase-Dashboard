export function Chip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surfaceAlt px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
      {text}
    </span>
  );
}
