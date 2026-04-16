import { z } from "zod";

// Modular env — each feature validates only what it needs, lazily.
// This lets us build phases incrementally without requiring every env var upfront.

function validate<T extends z.ZodTypeAny>(schema: T, label: string): z.infer<T> {
  // Use process.env directly but treat empty strings as undefined so shell
  // overrides of e.g. ANTHROPIC_API_KEY= don't blow past .env values.
  const raw: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(process.env)) {
    raw[k] = v === "" ? undefined : v;
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid ${label} env vars:\n${issues}\n\nSee .env.example for reference.`);
  }
  return parsed.data;
}

const coreSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i, "must be 32-byte hex (64 chars)"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  PDF_RENDER_SECRET: z.string().min(16),
});

const emailSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
  FROM_EMAIL: z.string().email(),
  FROM_NAME: z.string().default("Reportly"),
});

const redisSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

const googleSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const anthropicSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-5"),
});

const gumroadSchema = z.object({
  GUMROAD_ACCESS_TOKEN: z.string().min(1),
  GUMROAD_PRODUCT_URL: z.string().url(),
  GUMROAD_WEBHOOK_SECRET: z.string().min(1).optional(),
});

const supabaseSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().default("reports"),
});

// Lazy cached accessors
let coreCache: z.infer<typeof coreSchema> | null = null;
let emailCache: z.infer<typeof emailSchema> | null = null;
let redisCache: z.infer<typeof redisSchema> | null = null;
let googleCache: z.infer<typeof googleSchema> | null = null;
let anthropicCache: z.infer<typeof anthropicSchema> | null = null;
let gumroadCache: z.infer<typeof gumroadSchema> | null = null;
let supabaseCache: z.infer<typeof supabaseSchema> | null = null;

export const env = {
  core: () => (coreCache ??= validate(coreSchema, "core")),
  email: () => (emailCache ??= validate(emailSchema, "email")),
  redis: () => (redisCache ??= validate(redisSchema, "redis")),
  google: () => (googleCache ??= validate(googleSchema, "google")),
  anthropic: () => (anthropicCache ??= validate(anthropicSchema, "anthropic")),
  gumroad: () => (gumroadCache ??= validate(gumroadSchema, "gumroad")),
  supabase: () => (supabaseCache ??= validate(supabaseSchema, "supabase")),
};
