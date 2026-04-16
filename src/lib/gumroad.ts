import { env } from "./env";

const GUMROAD_API = "https://api.gumroad.com/v2";

export interface GumroadSale {
  sale_id: string;
  product_id: string;
  product_permalink: string;
  email: string;
  price: string; // cents as string
  currency: string;
  subscription_id?: string;
  recurrence?: "monthly" | "yearly" | null;
  license_key?: string | null;
  sale_timestamp: string;
  custom_fields?: Record<string, string>;
  url_params?: Record<string, string>;
  refunded?: boolean;
  disputed?: boolean;
  cancelled?: boolean;
  dead?: boolean;
  ended_at?: string | null;
  recurring_charge?: boolean;
}

/**
 * Build a hosted-checkout URL for the configured product.
 * Prefills email + attaches the userId as a URL parameter (shows up in ping payload as url_params).
 */
export function buildCheckoutUrl(opts: { email: string; userId: string }): string {
  const { GUMROAD_PRODUCT_URL } = env.gumroad();
  const params = new URLSearchParams({
    email: opts.email,
    wanted: "true",
    userId: opts.userId,
  });
  const sep = GUMROAD_PRODUCT_URL.includes("?") ? "&" : "?";
  return `${GUMROAD_PRODUCT_URL}${sep}${params.toString()}`;
}

/**
 * Build the subscriber self-management URL for a Gumroad subscription.
 * Buyers authenticate via the email Gumroad sent them when they subscribed.
 */
export function buildManageUrl(subscriptionId: string): string {
  return `https://gumroad.com/subscriptions/${subscriptionId}/manage`;
}

/**
 * Fetch a sale by ID using our access token, to verify a ping is authentic.
 * Gumroad does not sign pings, so we always call this after receiving a ping.
 */
export async function verifySale(saleId: string): Promise<GumroadSale | null> {
  const token = env.gumroad().GUMROAD_ACCESS_TOKEN;
  const res = await fetch(`${GUMROAD_API}/sales/${saleId}?access_token=${encodeURIComponent(token)}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { success?: boolean; sale?: GumroadSale };
  if (!json.success || !json.sale) return null;
  return json.sale;
}
