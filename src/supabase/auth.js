import { supabase } from "./config";

export async function adminSignIn(email, password) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function adminSignOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback) {
  if (!supabase) {
    callback(null);
    return () => {};
  }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  supabase.auth.getSession().then(({ data: { session } }) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}
