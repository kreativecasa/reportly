import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

let client: ReturnType<typeof createClient> | null = null;

export function supabase() {
  if (!client) {
    client = createClient(env.supabase().SUPABASE_URL, env.supabase().SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export async function uploadPdf(path: string, buffer: Buffer | Uint8Array): Promise<string> {
  const bucket = env.supabase().SUPABASE_STORAGE_BUCKET;
  const { error } = await supabase()
    .storage.from(bucket)
    .upload(path, buffer, { contentType: "application/pdf", upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  // Signed URL good for 7 days (re-signable)
  return (await signPdfUrl(path)) ?? "";
}

export async function signPdfUrl(path: string, expiresInSec = 60 * 60 * 24 * 7): Promise<string | null> {
  const bucket = env.supabase().SUPABASE_STORAGE_BUCKET;
  const { data, error } = await supabase().storage.from(bucket).createSignedUrl(path, expiresInSec);
  if (error) return null;
  return data?.signedUrl ?? null;
}
