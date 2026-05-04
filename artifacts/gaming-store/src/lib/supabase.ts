import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("VITE_SUPABASE_URL is not set");
if (!supabaseAnonKey) throw new Error("VITE_SUPABASE_ANON_KEY is not set");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = "gaming-store";

export async function uploadPaymentScreenshot(
  file: File,
  orderId: number,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `payment-screenshots/${orderId}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
