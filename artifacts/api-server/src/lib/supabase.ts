import { createClient } from "@supabase/supabase-js";

function resolveUrl(): string {
  for (const key of ["SUPABASE_URL", "VITE_SUPABASE_URL"]) {
    const val = (process.env[key] ?? "").trim();
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
  }
  throw new Error("SUPABASE_URL or VITE_SUPABASE_URL must be a valid https:// URL");
}

const supabaseUrl = resolveUrl();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseServiceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = "gaming-store";

export async function uploadFile(
  path: string,
  file: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
}
