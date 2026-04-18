import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-guard";
import { redis } from "@/lib/redis";
import { SelectSiteClient } from "./select-client";

interface Stash {
  sites: { siteUrl: string; permissionLevel: string }[];
}

export default async function SelectSitePage() {
  const session = await requireSession();
  const raw = await redis().get(`oauth:gsc:pending:${session.user.id}`);
  if (!raw) redirect("/integrations?error=session_expired");
  const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as Stash;

  return (
    <div className="max-w-2xl">
      <h1 className="stappli-title mb-2">Choose a Search Console site</h1>
      <p className="stappli-subtitle mb-8">Pick the verified site to pull data from.</p>
      <SelectSiteClient sites={parsed.sites} />
    </div>
  );
}
