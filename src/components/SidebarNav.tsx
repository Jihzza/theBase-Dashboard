import { NavLink } from "react-router-dom";

const base =
  "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-colors";

export function SidebarNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      base,
      isActive
        ? "border-[var(--accent-soft)] bg-surfaceAlt text-ink ring-1 ring-[rgba(153,27,27,0.25)]"
        : "border-border bg-surface text-muted hover-soft",
    ].join(" ");

  return (
    <div className="grid gap-2">
      <NavLink to="/app" end className={linkClass}>
        <span>Dashboard</span>
        <span className="text-xs text-zinc-500">↵</span>
      </NavLink>
      <NavLink to="/app/files" className={linkClass}>
        <span>Files</span>
        <span className="text-xs text-zinc-500">F</span>
      </NavLink>
      <NavLink to="/app/instructions" className={linkClass}>
        <span>Instructions</span>
        <span className="text-xs text-zinc-500">I</span>
      </NavLink>
      <NavLink to="/app/cron" className={linkClass}>
        <span>Cron</span>
        <span className="text-xs text-zinc-500">C</span>
      </NavLink>
      <NavLink to="/app/memory" className={linkClass}>
        <span>Memory</span>
        <span className="text-xs text-zinc-500">M</span>
      </NavLink>
      <NavLink to="/app/info" className={linkClass}>
        <span>Info</span>
        <span className="text-xs text-zinc-500">?</span>
      </NavLink>
    </div>
  );
}
