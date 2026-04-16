import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { VerifyEmail } from "@/emails/verify-email";
import { env } from "@/lib/env";
import { ok, handleError, ApiError } from "@/lib/api-response";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80).optional(),
});

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.parse(body);
    const email = parsed.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError("BAD_REQUEST", "An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name: parsed.name,
      },
    });

    const verification = await prisma.emailVerification.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
      },
    });

    const verifyUrl = `${env.core().NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verification.token}`;

    // Don't fail the signup if email send fails (e.g. Resend domain not verified).
    // Account is already created; user can request a new verification email.
    let emailSent = true;
    try {
      await sendEmail({
        to: email,
        subject: "Verify your Reportly email address",
        react: <VerifyEmail name={parsed.name} verifyUrl={verifyUrl} />,
      });
    } catch (emailErr) {
      emailSent = false;
      console.warn(`[signup] verification email to ${email} failed:`, emailErr);
    }

    return ok({ userId: user.id, emailSent, verifyUrl: process.env.NODE_ENV !== "production" ? verifyUrl : undefined }, 201);
  } catch (err) {
    return handleError(err);
  }
}
