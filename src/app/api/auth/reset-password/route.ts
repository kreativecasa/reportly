import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, handleError, ApiError } from "@/lib/api-response";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { token, password } = schema.parse(body);

    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset) throw new ApiError("BAD_REQUEST", "Invalid or expired reset link");
    if (reset.used) throw new ApiError("BAD_REQUEST", "This reset link has already been used");
    if (reset.expiresAt.getTime() < Date.now()) {
      throw new ApiError("BAD_REQUEST", "This reset link has expired");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { hashedPassword } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } }),
      // Invalidate all other outstanding resets
      prisma.passwordReset.updateMany({
        where: { userId: reset.userId, used: false },
        data: { used: true },
      }),
    ]);

    return ok({ message: "Password updated" });
  } catch (err) {
    return handleError(err);
  }
}
