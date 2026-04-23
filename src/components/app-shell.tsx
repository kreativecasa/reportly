import Link from "next/link";
import { auth, signOut } from "@/auth";
import { NavSidebar, MobileNav } from "./nav-sidebar";

function getInitials(email: string, name?: string | null) {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email.slice(0, 2).toUpperCase();
}

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const initials = getInitials(email, session?.user?.name);

  return (
    <div className="flex h-screen bg-[hsl(var(--muted))] overflow-hidden">
      {/* ── Sidebar (desktop) ── */}
      <div className="hidden lg:flex w-56 flex-shrink-0 bg-[hsl(var(--foreground))] flex-col">
        <NavSidebar email={email} initials={initials} />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-[hsl(var(--border))] flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-3 gap-4">
            {/* Mobile: logo + nav */}
            <div className="flex lg:hidden items-center gap-2.5 mr-2">
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                <span
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-white font-black text-[15px] tracking-tight"
                  style={{ background: "linear-gradient(135deg, #3475EF 0%, #1E5AE2 100%)" }}
                  aria-hidden
                >
                  R
                </span>
                <span className="text-base font-extrabold tracking-tight">Reportly</span>
              </Link>
            </div>
            <div className="flex lg:hidden flex-1 overflow-hidden">
              <MobileNav email={email} />
            </div>

            {/* Desktop: spacer */}
            <div className="hidden lg:block" />

            {/* Right: help + sign out. Identity is shown in the sidebar on desktop; mobile keeps a compact avatar below. */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href="mailto:support@reportlyapps.com"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--muted))]"
                title="Need help? Email support@reportlyapps.com"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Help
              </a>
              {/* Mobile-only compact avatar (identity also lives in the mobile nav toolbar) */}
              <div className="lg:hidden h-8 w-8 rounded-full bg-[hsl(var(--primary))/0.1] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--primary))]">
                {initials}
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--muted))]">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
