import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { AppShell } from "@/components/AppShell";
import { TopNav } from "@/components/TopNav";
import { requireSupabase, supabase } from "@/lib/supabase";

type MemoryRow = {
  created_at: string;
  content: string;
};

export default function MemoryPage() {
  const [row, setRow] = useState<MemoryRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const sb = requireSupabase();
      const { data, error } = await sb
        .from("memory_snapshot")
        .select("created_at,content")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn("Failed to fetch memory_snapshot:", error.message);
        setRow(null);
      } else {
        setRow((data as MemoryRow) ?? null);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell>
      <TopNav title="Memory" />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Memory</h1>
            <p className="mt-3 text-muted max-w-2xl">Latest memory snapshot ingested from Clawdbot.</p>
          </div>
          <div className="hidden md:block">
            <AppNav />
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <AppNav />
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 shadow-soft">
          {loading ? (
            <div className="text-sm text-muted">Loading…</div>
          ) : row ? (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Latest snapshot · {new Date(row.created_at).toLocaleString()}
              </div>
              <pre className="mt-4 overflow-auto rounded-xl border border-border bg-surfaceAlt p-4 text-xs text-ink whitespace-pre-wrap">
                {row.content}
              </pre>
            </>
          ) : (
            <div className="text-sm text-muted">No memory snapshot yet.</div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
