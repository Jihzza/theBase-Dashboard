import { useState } from "react";

const hubs = [
  { id: "saikan", name: "Saikan" },
  { id: "reflab", name: "RefLab" },
  { id: "studio", name: "Saikan Studio" },
];

export function HubSwitcher() {
  const [active, setActive] = useState("saikan");

  return (
    <div className="rounded-2xl border border-border bg-surfaceAlt p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Hub</div>
      <div className="mt-2 grid gap-2">
        {hubs.map((hub) => (
          <button
            key={hub.id}
            onClick={() => setActive(hub.id)}
            className={
              "rounded-xl border px-3 py-2 text-left text-sm transition-colors " +
              (active === hub.id
                ? "border-[var(--accent-soft)] bg-surface text-ink"
                : "border-border bg-surfaceAlt text-muted hover-soft")
            }
          >
            {hub.name}
          </button>
        ))}
      </div>
    </div>
  );
}
