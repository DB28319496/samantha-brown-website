import { supabase } from "./config";

function sanitizePath(contentKey, fileName) {
  // Replace dots in contentKey with dashes to avoid path issues
  const safeKey = contentKey.replace(/\./g, "-");
  // Remove special characters from filename, preserve extension
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${safeKey}/${Date.now()}_${safeName}`;
}

export async function uploadImage(file, contentKey) {
  if (!supabase) throw new Error("Supabase not configured — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");

  const path = sanitizePath(contentKey, file.name);

  const { error } = await supabase.storage
    .from("cms-images")
    .upload(path, file, { upsert: true });

  if (error) {
    if (error.message?.includes("Bucket not found")) {
      throw new Error("Storage bucket 'cms-images' not found — create it in your Supabase dashboard under Storage.");
    }
    if (error.message?.includes("not authorized") || error.statusCode === "403") {
      throw new Error("Upload not authorized — check your Supabase storage RLS policies allow authenticated uploads.");
    }
    throw error;
  }

  const { data } = supabase.storage
    .from("cms-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteImage(path) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.storage
    .from("cms-images")
    .remove([path]);

  if (error) throw error;
}
