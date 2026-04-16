import { requireSession } from "@/lib/auth-guard";
import { ok, handleError, ApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { buildManageUrl } from "@/lib/gumroad";

export async function POST() {
  try {
    const session = await requireSession();
    const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
    if (!sub?.gumroadSubscriptionId) {
      throw new ApiError("BAD_REQUEST", "No active Gumroad subscription. Use the subscribe link first.");
    }
    return ok({ url: buildManageUrl(sub.gumroadSubscriptionId) });
  } catch (err) {
    return handleError(err);
  }
}
