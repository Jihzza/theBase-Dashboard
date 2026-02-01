import { useEffect, useState } from "react";
import { requireSupabase, supabase } from "@/lib/supabase";
import { AppShell } from "@/components/AppShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (data.session) window.location.href = "/app";

      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) window.location.href = "/app";
      });

      return () => sub.subscription.unsubscribe();
    })();
  }, []);

  return (
    <AppShell>
      <main className="relative z-10 mx-auto max-w-xl px-6 py-24">
        <div className="bg-surface border border-border rounded-3xl p-10 shadow-soft">
          <h1 className="text-3xl font-semibold text-ink">The Base</h1>
          <p className="mt-3 text-muted">
            Sign in to access your private dashboard.
          </p>

          {!supabase ? (
            <div className="mt-8 rounded-2xl border border-border bg-surfaceAlt p-4 text-sm text-muted">
              Supabase is not configured yet.
              <div className="mt-2 text-xs">
                In Netlify, set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then redeploy.
              </div>
            </div>
          ) : null}

          <form
            className="mt-8 grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const sb = requireSupabase();
                const { error } = await sb.auth.signInWithPassword({
                  email,
                  password,
                });
                if (error) throw error;
                // Redirect handled by auth state change; keep as fallback.
                window.location.href = "/app";
              } catch (err: any) {
                setError(err?.message ?? "Failed to sign in");
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Email
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="rounded-lg border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Password
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="rounded-lg border border-border bg-surfaceAlt px-4 py-3 text-sm text-ink focus:outline-none focus:border-[var(--accent)]"
              />
            </label>

            {error ? (
              <div className="rounded-lg border border-border bg-surfaceAlt px-4 py-3 text-sm text-muted">
                {error}
              </div>
            ) : null}

            <button
              disabled={!supabase || loading}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-black transition-colors hover:bg-[#e6e6e6] disabled:opacity-50"
              type="submit"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-xs text-muted">
              For now, accounts are manually created.
            </p>
          </form>
        </div>
      </main>
    </AppShell>
  );
}
