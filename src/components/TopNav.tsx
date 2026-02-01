import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold tracking-[0.2em] uppercase text-ink">
            The Base
          </div>
          <div className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            {title}
            {email ? <span className="ml-3 text-zinc-500">· {email}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!supabase || busy}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover:text-ink hover:border-[var(--accent-soft)] transition-colors disabled:opacity-50"
            onClick={async () => {
              if (!supabase) return;
              setBusy(true);
              try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                window.location.href = "/login";
              } catch {
                // If sign out fails for any reason, force navigation anyway.
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
