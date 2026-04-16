import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/reports", label: "Reports" },
    { href: "/clients", label: "Clients" },
    { href: "/integrations", label: "Integrations" },
    { href: "/billing", label: "Billing" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#F3F9F8]">
      <header className="bg-white border-b border-[hsl(var(--border))]">
        <div className="stappli-page flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              Reportly
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 rounded-full text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[hsl(var(--muted-foreground))] hidden sm:inline">
              {session?.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="stappli-button-ghost">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="stappli-page py-10">{children}</main>
    </div>
  );
}
