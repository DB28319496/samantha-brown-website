import { supabase } from "./config";

export async function adminSignIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function adminSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  // Also fire immediately with current session
  supabase.auth.getSession().then(({ data: { session } }) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}
