import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function loadEnvFile(filePath: string): boolean {
  try {
    const envContent = readFileSync(filePath, "utf-8");
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const [key, ...valueParts] = trimmed.split("=");
      if (!key || process.env[key]) continue;

      process.env[key] = valueParts.join("=").trim();
    }

    return true;
  } catch {
    return false;
  }
}

for (const candidate of [
  ".env",
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "..", ".env"),
  resolve(process.cwd(), "..", "..", ".env"),
]) {
  if (loadEnvFile(candidate)) break;
}

function resolveUrl(): string {
  for (const key of ["SUPABASE_URL", "VITE_SUPABASE_URL"]) {
    const val = (process.env[key] ?? "").trim();
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
  }
  throw new Error("SUPABASE_URL or VITE_SUPABASE_URL must be a valid https:// URL");
}

let _client: SupabaseClient | null = null;

function resolveKey(): string {
  for (const k of ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]) {
    const val = (process.env[k] ?? "").trim();
    if (val) return val;
  }
  throw new Error("No Supabase key found — set SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, or VITE_SUPABASE_ANON_KEY");
}

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = resolveUrl();
  const key = resolveKey();
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

export const STORAGE_BUCKET = "gaming-store";

export async function uploadFile(
  path: string,
  file: Buffer,
  contentType: string,
): Promise<string> {
  const client = getClient();
  const { error } = await client.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const client = getClient();
  const { error } = await client.storage
    .from(STORAGE_BUCKET)
    .remove([path]);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
}
