import { supabase } from "./supabase";

const TABLE = "vallar_users";

/**
 * Ensures the user exists in vallar_users. If not, creates a row with default relationship_phase.
 * If they exist, updates last_active. Errors are swallowed so chat can proceed regardless.
 */
export async function ensureUserExists(email: string): Promise<void> {
  try {
    const { data, error: selectError } = await supabase
      .from(TABLE)
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (selectError) return;

    const now = new Date().toISOString();

    if (!data) {
      await supabase.from(TABLE).insert({
        email,
        relationship_phase: "acquaintance",
        last_active: now,
        created_at: now,
      });
    } else {
      await supabase
        .from(TABLE)
        .update({ last_active: now })
        .eq("email", email);
    }
  } catch {
    // Silently ignore — allow chat to proceed
  }
}
