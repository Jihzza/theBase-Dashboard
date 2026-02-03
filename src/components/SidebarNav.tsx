import { NavLink } from "react-router-dom";

const base =
  "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors";

const items = [
  { to: "/app", label: "Dashboard", icon: "▣", shortcut: "↵" },
  { to: "/app/docs", label: "Docs", icon: "📝", shortcut: "D" },
  { to: "/app/files", label: "Files", icon: "📄", shortcut: "F" },
  { to: "/app/logs", label: "Logs", icon: "🧾", shortcut: "L" },
  { to: "/app/calendar", label: "Calendar", icon: "📆", shortcut: "K" },
  { to: "/app/todos", label: "Todos", icon: "✅", shortcut: "T" },
  { to: "/app/instructions", label: "Instructions", icon: "🧭", shortcut: "I" },
  { to: "/app/cron", label: "Cron", icon: "⏱", shortcut: "C" },
  { to: "/app/memory", label: "Memory", icon: "🧠", shortcut: "M" },
  { to: "/app/bots", label: "Bots", icon: "🤖", shortcut: "B" },
  { to: "/app/bot-profiles", label: "Bot Profiles", icon: "👤", shortcut: "P" },
  { to: "/app/bot-feed", label: "Bot Feed", icon: "💬", shortcut: "BF" },
  { to: "/app/profile", label: "User Profile", icon: "👥", shortcut: "U" },
  { to: "/app/info", label: "Info", icon: "ℹ", shortcut: "?" },
];

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      base,
      isActive
        ? "border-[var(--accent-soft)] bg-surfaceAlt text-ink ring-1 ring-[rgba(124,58,237,0.35)]"
        : "border-border bg-surface text-muted hover-soft",
      collapsed ? "justify-center" : "justify-between",
    ].join(" ");

  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === "/app"} className={linkClass}>
          <span className="text-base leading-none">{item.icon}</span>
          {!collapsed ? (
            <span className="flex-1 truncate text-sm">{item.label}</span>
          ) : null}
          {!collapsed ? <span className="text-xs text-zinc-500">{item.shortcut}</span> : null}
        </NavLink>
      ))}
    </div>
  );
}
