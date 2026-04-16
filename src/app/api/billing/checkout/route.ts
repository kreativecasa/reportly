import { requireSession } from "@/lib/auth-guard";
import { ok, handleError, ApiError } from "@/lib/api-response";
import { buildCheckoutUrl } from "@/lib/gumroad";

export async function POST() {
  try {
    const session = await requireSession();
    if (!session.user.email) throw new ApiError("BAD_REQUEST", "Account email missing");
    const url = buildCheckoutUrl({ email: session.user.email, userId: session.user.id });
    return ok({ url });
  } catch (err) {
    return handleError(err);
  }
}
