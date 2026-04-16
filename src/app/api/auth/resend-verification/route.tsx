import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { VerifyEmail } from "@/emails/verify-email";
import { env } from "@/lib/env";
import { ok, handleError } from "@/lib/api-response";
import { ratelimit } from "@/lib/redis";

const schema = z.object({ email: z.string().email() });
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await ratelimit("forgotPassword").limit(`resend-verify:${ip}`);
    if (!success) return ok({ message: "If an account exists, a verification email has been sent." });

    const body = await req.json().catch(() => null);
    const { email } = schema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user && !user.emailVerified) {
      await prisma.emailVerification.deleteMany({ where: { userId: user.id } });
      const verification = await prisma.emailVerification.create({
        data: { userId: user.id, expiresAt: new Date(Date.now() + VERIFY_TTL_MS) },
      });
      const verifyUrl = `${env.core().NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verification.token}`;
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your Reportly email address",
          react: <VerifyEmail name={user.name ?? undefined} verifyUrl={verifyUrl} />,
        });
      } catch (emailErr) {
        console.warn(`[resend-verification] email to ${user.email} failed:`, emailErr);
      }
    }

    return ok({ message: "If an account exists, a verification email has been sent." });
  } catch (err) {
    return handleError(err);
  }
}
