import { supabase } from "./config";

// Uses a simple "content" table with columns: id (text PK), data (jsonb)
// Two rows: "live" and "draft"

export async function fetchContent(docId) {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("content")
    .select("data")
    .eq("id", docId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = "no rows found" — that's fine, return empty
    console.error("Fetch content error:", error);
  }
  return data?.data || {};
}

export async function saveContent(docId, content) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase
    .from("content")
    .upsert({ id: docId, data: content, updated_at: new Date().toISOString() });

  if (error) throw error;
}
