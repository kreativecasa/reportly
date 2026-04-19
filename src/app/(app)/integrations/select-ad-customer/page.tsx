import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-guard";
import { redis } from "@/lib/redis";
import { SelectAdCustomerClient } from "./select-client";

interface Stash {
  customers: { customerId: string; descriptiveName: string; currencyCode: string; timeZone: string; isManager: boolean }[];
}

export default async function SelectAdCustomerPage() {
  const session = await requireSession();
  const raw = await redis().get(`oauth:gads:pending:${session.user.id}`);
  if (!raw) redirect("/integrations?error=session_expired");
  const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as Stash;

  return (
    <div className="max-w-2xl">
      <h1 className="stappli-title mb-2">Choose a Google Ads account</h1>
      <p className="stappli-subtitle mb-8">Pick the ad account to pull data from. Manager accounts won&apos;t return metrics — pick a client account under the manager instead.</p>
      <SelectAdCustomerClient customers={parsed.customers} />
    </div>
  );
}
