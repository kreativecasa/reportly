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
            <div className="flex lg:hidden items-center gap-3">
              <Link href="/dashboard" className="text-base font-bold mr-2">Reportly</Link>
            </div>
            <div className="flex lg:hidden flex-1 overflow-hidden">
              <MobileNav email={email} />
            </div>

            {/* Desktop: spacer */}
            <div className="hidden lg:block" />

            {/* Right: user + sign out */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[hsl(var(--primary))/0.1] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--primary))]">
                  {initials}
                </div>
                <span className="text-xs text-[hsl(var(--muted-foreground))] max-w-[160px] truncate">{email}</span>
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
