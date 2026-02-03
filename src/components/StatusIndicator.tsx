import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type StatusRow = {
  updated_at: string;
  state: "working" | "idle";
  note: string | null;
};

export function StatusIndicator() {
  const [row, setRow] = useState<StatusRow | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("agent_status")
        .select("updated_at,state,note")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!alive) return;
      if (error) {
        console.warn("Failed to load agent_status:", error.message);
        setRow(null);
        return;
      }
      setRow((data as StatusRow) ?? null);
    }

    void load();
    const t = setInterval(load, 30_000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const state = row?.state ?? "idle";
  const updatedAt = row?.updated_at ? new Date(row.updated_at).getTime() : 0;
  const ageMs = updatedAt ? now - updatedAt : Number.POSITIVE_INFINITY;

  // Safety: if status hasn't been updated recently, treat as idle.
  const stale = ageMs > 10 * 60 * 1000;
  const effective = stale ? "idle" : state;

  const label = effective === "working" ? "Working" : "Idle";

  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className={
          effective === "working"
            ? "relative flex h-2.5 w-2.5"
            : "relative flex h-2.5 w-2.5 opacity-70"
        }
      >
        {effective === "working" ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </>
        ) : (
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-zinc-500" />
        )}
      </span>

      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
        {stale ? " (stale)" : ""}
      </span>

      {row?.note && effective === "working" ? (
        <span className="hidden md:inline text-[11px] text-zinc-500">· {row.note}</span>
      ) : null}
    </div>
  );
}
