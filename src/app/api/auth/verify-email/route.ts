import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = env.core().NEXT_PUBLIC_APP_URL;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/verify-email?status=invalid`);
  }

  const verification = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification) {
    return NextResponse.redirect(`${appUrl}/verify-email?status=invalid`);
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerification.delete({ where: { id: verification.id } });
    return NextResponse.redirect(`${appUrl}/verify-email?status=expired`);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerification.deleteMany({ where: { userId: verification.userId } }),
  ]);

  return NextResponse.redirect(`${appUrl}/verify-email?status=success`);
}
