import { supabase } from "./supabase";

const TABLE = "vallar_conversations";
const PREVIEW_MAX_LENGTH = 40;

export interface ConversationRow {
  user_email: string;
  session_date: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface SessionWithPreview {
  session_date: string;
  preview: string;
}

/**
 * Fetch distinct sessions for a user: one per conversation, with preview (first user message).
 * session_date is used as unique conversation id (e.g. ISO timestamp).
 */
export async function fetchSessions(userEmail: string): Promise<SessionWithPreview[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("session_date, content, created_at")
    .eq("user_email", userEmail)
    .eq("role", "user");

  if (error) throw error;
  if (!data?.length) return [];

  // Per session_date, keep the earliest user message (by created_at) as preview
  const bySession = new Map<string, { content: string; created_at: string }>();
  for (const row of data as { session_date: string; content: string; created_at: string }[]) {
    const key = row.session_date;
    const existing = bySession.get(key);
    if (!existing || row.created_at < existing.created_at) {
      bySession.set(key, { content: row.content, created_at: row.created_at });
    }
  }

  // Sort by session_date desc (newest first)
  const entries = Array.from(bySession.entries()).sort(
    (a, b) => (b[0] > a[0] ? 1 : -1)
  );
  return entries.map(([session_date, { content }]) => ({
    session_date,
    preview: truncatePreview(content),
  }));
}

/**
 * Fetch full conversation for a session, ordered by created_at.
 */
export async function fetchConversation(
  userEmail: string,
  sessionDate: string
): Promise<{ role: "user" | "assistant"; content: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("role, content, created_at")
    .eq("user_email", userEmail)
    .eq("session_date", sessionDate)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.content as string,
    created_at: r.created_at as string,
  }));
}

/**
 * Insert one message into vallar_conversations.
 */
export async function insertMessage(
  userEmail: string,
  sessionDate: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({
    user_email: userEmail,
    session_date: sessionDate,
    role,
    content,
  });
  if (error) throw error;
}

function truncatePreview(text: string): string {
  const t = text.trim();
  if (t.length <= PREVIEW_MAX_LENGTH) return t;
  return t.slice(0, PREVIEW_MAX_LENGTH).trimEnd() + "…";
}
