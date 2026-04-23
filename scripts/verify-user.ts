import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
  const email = "techation@hotmail.com";
  const u = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
  const del = await prisma.emailVerification.deleteMany({ where: { userId: u.id } });
  console.log(JSON.stringify({ id: u.id, email: u.email, emailVerified: u.emailVerified, tokensRemoved: del.count }, null, 2));
  await prisma.$disconnect();
})();
