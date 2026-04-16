import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F9F8] to-white flex flex-col">
      <header className="stappli-page py-6 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[hsl(var(--foreground))]">
          Reportly
        </Link>
        <Link href="/" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
          ← Back to website
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 pb-20 pt-6">
        <div className="w-full max-w-md stappli-card p-8">{children}</div>
      </main>
    </div>
  );
}
