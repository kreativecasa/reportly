import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { TrialEndingEmail } from "@/emails/trial-ending";

/**
 * Daily cron: find TRIALING subscriptions whose trial ends in ~7 days and
 * haven't already been emailed. Sends a single reminder per user.
 */
export const trialEndingCron = inngest.createFunction(
  {
    id: "trial-ending-cron",
    retries: 1,
    triggers: [{ cron: "0 14 * * *" }], // 14:00 UTC daily
  },
  async ({ step }) => {
    const now = new Date();
    const windowStart = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

    const candidates = await step.run("find-trials-ending-soon", async () => {
      return prisma.subscription.findMany({
        where: {
          plan: "FREE",
          status: "TRIALING",
          trialEndingNotifiedAt: null,
          trialEnd: { gte: windowStart, lte: windowEnd },
        },
        include: { user: true },
      });
    });

    const appUrl = env.core().NEXT_PUBLIC_APP_URL;
    let sent = 0;

    for (const sub of candidates) {
      if (!sub.user?.email) continue;
      const trialEnd = sub.trialEnd ? new Date(sub.trialEnd) : null;
      if (!trialEnd) continue;
      const daysLeft = Math.max(
        1,
        Math.ceil((trialEnd.getTime() - now.getTime()) / 86_400_000),
      );
      await step.run(`send-${sub.id}`, async () => {
        await sendEmail({
          to: sub.user.email,
          subject: `Your Reportly trial ends in ${daysLeft} days`,
          react: <TrialEndingEmail daysLeft={daysLeft} upgradeUrl={`${appUrl}/billing`} />,
        });
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { trialEndingNotifiedAt: new Date() },
        });
      });
      sent++;
    }

    return { candidates: candidates.length, sent };
  },
);
