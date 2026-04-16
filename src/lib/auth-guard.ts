import { auth } from "@/auth";
import { prisma } from "./prisma";
import { ApiError } from "./api-response";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("UNAUTHORIZED", "Not signed in");
  return session;
}

export async function requireWorkspace() {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({ where: { ownerId: session.user.id } });
  if (!workspace) throw new ApiError("FORBIDDEN", "No workspace. Complete onboarding first.");
  return { session, workspace };
}

export async function requireWorkspaceOwnership(workspaceId: string) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: session.user.id },
  });
  if (!workspace) throw new ApiError("FORBIDDEN", "Access denied");
  return { session, workspace };
}

export async function requireVerifiedEmail() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { emailVerified: true } });
  if (!user?.emailVerified) throw new ApiError("FORBIDDEN", "Email not verified");
  return session;
}
