import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "./env";

let redisClient: Redis | null = null;

export function redis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: env.redis().UPSTASH_REDIS_REST_URL,
      token: env.redis().UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redisClient;
}

type LimitKey =
  | "generateReport"
  | "forgotPassword"
  | "signup"
  | "resetPassword"
  | "ga4Finalize"
  | "gumroadWebhook"
  | "global";

const limitConfig: Record<LimitKey, { limiter: ReturnType<typeof Ratelimit.slidingWindow>; prefix: string }> = {
  generateReport: { limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:gen-report" },
  forgotPassword: { limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:forgot-pw" },
  signup: { limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:signup" },
  resetPassword: { limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:reset-pw" },
  ga4Finalize: { limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:ga4-finalize" },
  gumroadWebhook: { limiter: Ratelimit.slidingWindow(120, "1 m"), prefix: "rl:gumroad-hook" },
  global: { limiter: Ratelimit.slidingWindow(100, "1 m"), prefix: "rl:global" },
};

const limitCache = new Map<LimitKey, Ratelimit>();

export function ratelimit(key: LimitKey): Ratelimit {
  let rl = limitCache.get(key);
  if (!rl) {
    const cfg = limitConfig[key];
    rl = new Ratelimit({ redis: redis(), limiter: cfg.limiter, analytics: false, prefix: cfg.prefix });
    limitCache.set(key, rl);
  }
  return rl;
}
