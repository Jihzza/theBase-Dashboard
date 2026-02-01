import { NavLink } from "react-router-dom";

const base =
  "text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-colors";

export function AppNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      base,
      isActive
        ? "border-[var(--accent-soft)] text-ink"
        : "border-border text-muted hover:text-ink hover:border-[var(--accent-soft)]",
    ].join(" ");

  return (
    <div className="flex flex-wrap gap-2">
      <NavLink to="/app" end className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/app/info" className={linkClass}>
        Info
      </NavLink>
      <NavLink to="/app/cron" className={linkClass}>
        Cron
      </NavLink>
      <NavLink to="/app/instructions" className={linkClass}>
        Instructions
      </NavLink>
      <NavLink to="/app/memory" className={linkClass}>
        Memory
      </NavLink>
      <NavLink to="/app/files" className={linkClass}>
        Files
      </NavLink>
    </div>
  );
}
