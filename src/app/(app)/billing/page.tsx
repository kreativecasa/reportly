import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { format } from "date-fns";
import { BillingActions } from "./billing-actions";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { invoices: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  const { success } = await searchParams;

  const now = new Date();
  const trialRemainingDays =
    sub?.trialEnd && sub.trialEnd > now ? Math.ceil((sub.trialEnd.getTime() - now.getTime()) / 86_400_000) : 0;

  return (
    <div className="max-w-3xl">
      <h1 className="stappli-title mb-2">Billing</h1>
      <p className="stappli-subtitle mb-8">Manage your subscription and invoices.</p>

      {success && (
        <div className="stappli-card p-4 mb-6 border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-900">✓ You&apos;re now on Reportly paid 🎉</p>
        </div>
      )}

      <div className="stappli-card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="stappli-table-header mb-1">Current plan</p>
            <p className="text-2xl font-bold">
              {sub?.plan === "PAID" ? "Reportly · $8/mo" : "Trial / Free"}
            </p>
            {sub?.status === "TRIALING" && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Trial ends in {trialRemainingDays} day{trialRemainingDays === 1 ? "" : "s"}
              </p>
            )}
            {sub?.currentPeriodEnd && sub.status === "ACTIVE" && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Renews {format(sub.currentPeriodEnd, "MMM d, yyyy")}
              </p>
            )}
            {sub?.status === "PAST_DUE" && (
              <p className="text-sm text-[hsl(var(--destructive))] mt-1">
                Payment failed — please update your payment method.
              </p>
            )}
            {sub?.cancelAtPeriodEnd && (
              <p className="text-sm text-amber-700 mt-1">
                Cancels at the end of the current period.
              </p>
            )}
          </div>
          <BillingActions plan={sub?.plan ?? "FREE"} hasSubscription={Boolean(sub?.gumroadSubscriptionId)} />
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Invoices</h2>
      {sub?.invoices?.length ? (
        <div className="stappli-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th className="stappli-table-header text-left px-6 py-3">Date</th>
                <th className="stappli-table-header text-left px-6 py-3">Amount</th>
                <th className="stappli-table-header text-left px-6 py-3">Status</th>
                <th className="stappli-table-header text-right px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {sub.invoices.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0 border-[hsl(var(--border))]">
                  <td className="px-6 py-3 text-sm">{format(inv.createdAt, "MMM d, yyyy")}</td>
                  <td className="px-6 py-3 text-sm">${(inv.amount / 100).toFixed(2)}</td>
                  <td className="px-6 py-3 text-sm">{inv.status}</td>
                  <td className="px-6 py-3 text-right">
                    {inv.receiptUrl && (
                      <a href={inv.receiptUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(var(--primary))] hover:underline">
                        Receipt
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="stappli-card p-6 text-sm text-[hsl(var(--muted-foreground))]">No invoices yet.</div>
      )}
    </div>
  );
}
