"use client";

import Link from "next/link";

interface ClientRow {
  id: string;
  name: string;
  industry: string | null;
  contactEmail: string | null;
  reportCount: number;
}

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  if (clients.length === 0) {
    return (
      <div className="stappli-card p-10 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">No clients yet.</p>
        <Link href="/clients/new" className="stappli-button-primary">
          Add your first client
        </Link>
      </div>
    );
  }

  return (
    <div className="stappli-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[hsl(var(--border))]">
            <th className="stappli-table-header text-left px-6 py-4">Name</th>
            <th className="stappli-table-header text-left px-6 py-4">Industry</th>
            <th className="stappli-table-header text-left px-6 py-4">Contact</th>
            <th className="stappli-table-header text-right px-6 py-4">Reports</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="stappli-table-row border-b last:border-0 border-[hsl(var(--border))]">
              <td className="px-6 py-4">
                <Link href={`/clients/${c.id}`} className="font-medium hover:text-[hsl(var(--primary))]">
                  {c.name}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">{c.industry ?? "—"}</td>
              <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">{c.contactEmail ?? "—"}</td>
              <td className="px-6 py-4 text-sm text-right font-medium">{c.reportCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
