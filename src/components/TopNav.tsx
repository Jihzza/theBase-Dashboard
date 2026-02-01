import { supabase } from "@/lib/supabase";

export function TopNav({ title }: { title: string }) {
  return (
    <nav className="fixed w-full z-50 top-0 border-b border-border nav-blur">
      <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold tracking-[0.2em] uppercase text-ink">
            The Base
          </div>
          <div className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            {title}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] px-4 py-2 border border-border rounded-full hover:text-ink hover:border-[var(--accent-soft)] transition-colors"
            onClick={async (e) => {
              e.preventDefault();
              if (!supabase) return;
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
          >
            Sign out
          </a>
        </div>
      </div>
    </nav>
  );
}
