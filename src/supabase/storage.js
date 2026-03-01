import { supabase } from "./config";

export async function uploadImage(file, contentKey) {
  if (!supabase) throw new Error("Supabase not configured");
  const path = `${contentKey}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage
    .from("cms-images")
    .upload(path, file, { upsert: true });

  if (error) throw error;

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
