import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) redirect("/onboarding");

  return (
    <div className="max-w-2xl">
      <h1 className="stappli-title mb-2">Settings</h1>
      <p className="stappli-subtitle mb-8">Workspace branding and account.</p>

      <SettingsForm
        workspace={{
          id: workspace.id,
          name: workspace.name,
          brandColor: workspace.brandColor,
          logoUrl: workspace.logoUrl,
        }}
        user={{ email: session.user.email ?? "", name: session.user.name ?? "" }}
      />
    </div>
  );
}
