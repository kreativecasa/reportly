import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-guard";
import { redis } from "@/lib/redis";
import { SelectPropertyClient } from "./select-client";

interface Stash {
  properties: { propertyId: string; displayName: string; accountName?: string }[];
}

export default async function SelectPropertyPage() {
  const session = await requireSession();
  const raw = await redis().get(`oauth:ga4:pending:${session.user.id}`);
  if (!raw) redirect("/integrations?error=session_expired");
  const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as Stash;

  return (
    <div className="max-w-2xl">
      <h1 className="stappli-title mb-2">Choose a Google Analytics property</h1>
      <p className="stappli-subtitle mb-8">Pick the GA4 property to pull data from.</p>
      <SelectPropertyClient properties={parsed.properties} />
    </div>
  );
}
