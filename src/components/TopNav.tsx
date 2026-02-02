import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StatusIndicator } from "@/components/StatusIndicator";

export function TopNav({ title }: { title: string }) {
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setEmail(session?.user?.email ?? null);
      });
      return () => sub.subscription.unsubscribe();
    })();
  }, []);

  return (
    <nav className="sticky top-0 z-40 mb-6 rounded-2xl border border-border bg-surface/80 px-6 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Section</div>
          <div className="text-lg font-semibold text-ink">{title}</div>
          {email ? <div className="text-xs text-muted">{email}</div> : null}
        </div>

        <div className="flex items-center gap-3">
          <StatusIndicator />
          <button
            type="button"
            disabled={!supabase || busy}
            className="rounded-full border border-border bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted hover-soft disabled:opacity-50"
            onClick={async () => {
              if (!supabase) return;
              setBusy(true);
              try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                window.location.href = "/login";
              } catch {
                window.location.href = "/login";
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
