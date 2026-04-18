import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-guard";
import { redis } from "@/lib/redis";
import { SelectAdAccountClient } from "./select-client";

interface Stash {
  accounts: { accountId: string; name: string; currency: string; status: number }[];
}

export default async function SelectAdAccountPage() {
  const session = await requireSession();
  const raw = await redis().get(`oauth:meta:pending:${session.user.id}`);
  if (!raw) redirect("/integrations?error=session_expired");
  const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as Stash;

  return (
    <div className="max-w-2xl">
      <h1 className="stappli-title mb-2">Choose a Meta Ads account</h1>
      <p className="stappli-subtitle mb-8">Pick the ad account to pull data from.</p>
      <SelectAdAccountClient accounts={parsed.accounts} />
    </div>
  );
}
