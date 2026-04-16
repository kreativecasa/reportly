import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { PasswordResetEmail } from "@/emails/password-reset";
import { env } from "@/lib/env";
import { ok, handleError } from "@/lib/api-response";
import { ratelimit } from "@/lib/redis";

const schema = z.object({ email: z.string().email() });
const RESET_TTL_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await ratelimit("forgotPassword").limit(`forgot:${ip}`);
    // Always return the same response regardless — don't leak existence
    if (!success) {
      return ok({ message: "If that email exists, you'll receive a reset link." });
    }

    const body = await req.json().catch(() => null);
    const { email } = schema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user) {
      await prisma.passwordReset.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });
      const reset = await prisma.passwordReset.create({
        data: { userId: user.id, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
      });
      const resetUrl = `${env.core().NEXT_PUBLIC_APP_URL}/reset-password?token=${reset.token}`;
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your Reportly password",
          react: <PasswordResetEmail resetUrl={resetUrl} />,
        });
      } catch (emailErr) {
        console.warn(`[forgot-password] email to ${user.email} failed:`, emailErr);
      }
    }

    return ok({ message: "If that email exists, you'll receive a reset link." });
  } catch (err) {
    return handleError(err);
  }
}
