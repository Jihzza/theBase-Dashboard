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
    <nav className="fixed w-full z-50 top-0 border-b border-border nav-blur">
      <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl border border-border bg-surface flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--accent-ink)]">B</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-ink">The Base</div>
              <div className="text-[11px] text-muted">
                {title}
                {email ? <span className="ml-2 text-zinc-500">· {email}</span> : null}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <StatusIndicator />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <StatusIndicator />
          </div>
          <button
            type="button"
            disabled={!supabase || busy}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover-soft disabled:opacity-50"
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
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60" />
    </nav>
  );
}
