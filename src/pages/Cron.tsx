import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { requireSupabase, supabase } from "@/lib/supabase";

type CronRow = {
  created_at: string;
  payload: any;
};

export default function CronPage() {
  const [row, setRow] = useState<CronRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const sb = requireSupabase();
      const { data, error } = await sb
        .from("cron_snapshot")
        .select("created_at,payload")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn("Failed to fetch cron_snapshot:", error.message);
        setRow(null);
      } else {
        setRow((data as CronRow) ?? null);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell>
      <AppLayout title="Cron">
        <Panel
          title="Cron jobs"
          subtitle="Latest snapshot. Updates when Clawdbot ingests a new snapshot."
        >
          {loading ? (
            <div className="text-sm text-muted">Loading…</div>
          ) : row ? (
            <>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Latest snapshot · {new Date(row.created_at).toLocaleString()}
              </div>
              <pre className="mt-4 overflow-auto rounded-xl border border-border bg-surfaceAlt p-4 text-xs text-ink">
                {JSON.stringify(row.payload, null, 2)}
              </pre>
            </>
          ) : (
            <div className="text-sm text-muted">No cron snapshot yet.</div>
          )}
        </Panel>
      </AppLayout>
    </AppShell>
  );
}
