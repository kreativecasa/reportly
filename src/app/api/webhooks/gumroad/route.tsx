import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySale } from "@/lib/gumroad";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { PaymentFailedEmail } from "@/emails/payment-failed";
import { ratelimit } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * Gumroad sends two kinds of pings:
 *   1. "Sale" ping (legacy): form-urlencoded, fires on new sales + recurring charges
 *   2. "Resource subscription" ping: JSON, fires on sale/cancellation/refund/subscription_* events
 *
 * This handler accepts both. Authenticity is verified by calling Gumroad's API for the sale_id.
 * An optional shared-secret path-query (?secret=...) is also supported if GUMROAD_WEBHOOK_SECRET is set.
 */

interface ResourcePingBody {
  resource_name?: string; // "sale" | "refund" | "dispute" | "dispute_won" | "cancellation" | "subscription_updated" | "subscription_ended" | "subscription_restarted"
  subscription_id?: string;
  sale_id?: string;
  product_id?: string;
  product_permalink?: string;
  email?: string;
  recurrence?: string;
  license_key?: string;
  ended_at?: string;
  cancelled_at?: string;
  user_requested_cancellation_at?: string;
  [k: string]: unknown;
}

async function readBody(req: NextRequest): Promise<ResourcePingBody> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await req.json()) as ResourcePingBody;
  }
  // form-urlencoded (legacy sale ping)
  const text = await req.text();
  const params = new URLSearchParams(text);
  const body: Record<string, unknown> = {};
  params.forEach((v, k) => {
    // Flatten url_params[userId] and custom_fields[x] into dotted keys
    body[k] = v;
  });
  if (!body.resource_name && body.sale_id) body.resource_name = "sale";
  return body as ResourcePingBody;
}

function pickUserIdFromPing(body: ResourcePingBody): string | null {
  // Gumroad sends url_params as bracket-notation keys (e.g. url_params[userId]=...)
  const keys = ["url_params[userId]", "url_params.userId", "userId"];
  for (const k of keys) {
    const v = body[k as keyof ResourcePingBody];
    if (typeof v === "string" && v.length > 0) return v;
  }
  // Some ping formats nest url_params as an object
  const urlParams = body.url_params as Record<string, string> | undefined;
  if (urlParams?.userId) return urlParams.userId;
  return null;
}

export async function POST(req: NextRequest) {
  // Optional shared secret check (recommend setting GUMROAD_WEBHOOK_SECRET and appending ?secret=... to the Ping URL)
  const expectedSecret = env.gumroad().GUMROAD_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided = req.nextUrl.searchParams.get("secret");
    if (provided !== expectedSecret) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // Defence-in-depth: cap per-IP webhook rate so a leaked secret can't be weaponised into a DoS.
  // Legit Gumroad retries stay well under 120/min.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  try {
    const { success } = await ratelimit("gumroadWebhook").limit(`gumroad:${ip}`);
    if (!success) return new Response("Too many requests", { status: 429 });
  } catch {
    // Redis unavailable — skip rate limiting
  }

  let body: ResourcePingBody;
  try {
    body = await readBody(req);
  } catch {
    return new Response("Bad body", { status: 400 });
  }

  const resource = String(body.resource_name ?? "sale");
  const saleId = body.sale_id ?? null;
  const subscriptionId = body.subscription_id ?? null;
  const eventKey = `${resource}:${saleId ?? subscriptionId ?? Date.now()}`;

  // Idempotency
  try {
    await prisma.gumroadEvent.create({ data: { id: eventKey, resource } });
  } catch {
    return new Response("Already processed", { status: 200 });
  }

  try {
    // Authenticate by fetching the sale from Gumroad's API (only if we have a sale_id).
    // No sale_id means pure subscription-event pings (cancellation, ended) — we trust those by matching stored subscriptionId.
    const verifiedSale = saleId ? await verifySale(saleId) : null;
    if (saleId && !verifiedSale) {
      return new Response("Sale verification failed", { status: 400 });
    }

    const email = (verifiedSale?.email ?? body.email ?? "").toLowerCase();
    const userIdFromPing = pickUserIdFromPing(body);

    // Resolve the user / subscription
    let sub = null;
    if (userIdFromPing) {
      sub = await prisma.subscription.findUnique({ where: { userId: userIdFromPing } });
    }
    if (!sub && subscriptionId) {
      sub = await prisma.subscription.findUnique({ where: { gumroadSubscriptionId: subscriptionId } });
    }
    if (!sub && email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
    }
    if (!sub) {
      // Buyer not linked to any Reportly account. Record event + return 200 so Gumroad stops retrying.
      return new Response("No matching user", { status: 200 });
    }

    switch (resource) {
      case "sale": {
        // Initial purchase or recurring charge
        const newSubId = verifiedSale?.subscription_id ?? subscriptionId ?? sub.gumroadSubscriptionId ?? null;
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            plan: "PAID",
            status: "ACTIVE",
            gumroadSaleId: sub.gumroadSaleId ?? saleId,
            gumroadSubscriptionId: newSubId,
            gumroadProductId: verifiedSale?.product_id ?? (body.product_id as string) ?? sub.gumroadProductId,
            gumroadLicenseKey: verifiedSale?.license_key ?? sub.gumroadLicenseKey,
            cancelAtPeriodEnd: false,
            cancelledAt: null,
          },
        });
        if (saleId && verifiedSale) {
          await prisma.invoice.upsert({
            where: { gumroadSaleId: saleId },
            update: {},
            create: {
              subscriptionId: sub.id,
              gumroadSaleId: saleId,
              amount: Number(verifiedSale.price ?? 0),
              currency: verifiedSale.currency ?? "usd",
              status: "paid",
              periodStart: new Date(verifiedSale.sale_timestamp ?? Date.now()),
              periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
        break;
      }

      case "subscription_updated":
      case "subscription_restarted": {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { plan: "PAID", status: "ACTIVE", cancelAtPeriodEnd: false, cancelledAt: null },
        });
        break;
      }

      case "cancellation": {
        // Still active until end of period
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { cancelAtPeriodEnd: true, cancelledAt: new Date() },
        });
        break;
      }

      case "subscription_ended": {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { plan: "FREE", status: "CANCELED" },
        });
        break;
      }

      case "refund":
      case "dispute": {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { plan: "FREE", status: "UNPAID" },
        });
        try {
          const user = await prisma.user.findUnique({ where: { id: sub.userId } });
          if (user) {
            await sendEmail({
              to: user.email,
              subject: "Payment issue on your Reportly account",
              react: <PaymentFailedEmail billingUrl={`${env.core().NEXT_PUBLIC_APP_URL}/billing`} />,
            });
          }
        } catch {
          // non-fatal
        }
        break;
      }

      case "dispute_won": {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { plan: "PAID", status: "ACTIVE" },
        });
        break;
      }

      default:
        // unknown event — already recorded in GumroadEvent for audit
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Gumroad webhook error:", err);
    // Don't let Gumroad retry forever on unrelated errors
    return new Response("Handler error", { status: 500 });
  }
}
