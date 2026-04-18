import Link from "next/link";
import Icon from "@mdi/react";
import { mdiRocketLaunch } from "@mdi/js";

const COPY: Record<string, { title: string; body: string }> = {
  clients: {
    title: "Client limit reached",
    body: "Your current plan only covers so many active clients. Upgrade to add more.",
  },
  reports: {
    title: "Monthly report limit reached",
    body: "You've used every report in this billing cycle. Upgrade to keep generating.",
  },
  integrations: {
    title: "Integration limit reached",
    body: "Your current plan doesn't allow another connected data source. Upgrade to add more.",
  },
};

export function UpgradePrompt({
  limit,
  upgradeUrl = "/billing",
}: {
  limit?: string;
  upgradeUrl?: string;
}) {
  const copy = (limit ? COPY[limit] : undefined) ?? {
    title: "Plan limit reached",
    body: "Upgrade your plan to continue.",
  };
  return (
    <div className="stappli-card p-4 border-amber-200 bg-amber-50 flex items-start gap-3">
      <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
        <Icon path={mdiRocketLaunch} size={0.8} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-900">{copy.title}</p>
        <p className="text-sm text-amber-900/80 mt-0.5">{copy.body}</p>
      </div>
      <Link href={upgradeUrl} className="stappli-button-primary shrink-0 text-sm">
        Upgrade
      </Link>
    </div>
  );
}
