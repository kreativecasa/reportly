import { z } from "zod";

/**
 * Shared password validator used at every sign-in / sign-up / reset surface.
 *
 * Rules:
 *   - At least 8 characters total
 *   - At most 128 characters
 *   - At least 8 NON-whitespace characters (so "        " or "pa ss    " is rejected).
 *     This prevents accidentally-created accounts where the user hits space or tab
 *     repeatedly, while still allowing legitimate passphrases like
 *     "correct horse battery staple".
 *   - No leading or trailing whitespace (almost always a typo / paste artifact)
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .refine((pw) => pw === pw.trim(), {
    message: "Password cannot start or end with a space",
  })
  .refine((pw) => pw.replace(/\s/g, "").length >= 8, {
    message: "Password must contain at least 8 non-whitespace characters",
  });

export function validatePassword(raw: string): { ok: true } | { ok: false; message: string } {
  const result = passwordSchema.safeParse(raw);
  if (result.success) return { ok: true };
  return { ok: false, message: result.error.issues[0]?.message ?? "Invalid password" };
}
