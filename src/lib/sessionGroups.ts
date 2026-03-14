import type { SessionWithPreview } from "./conversations";

export type SessionGroupLabel = "Today" | "Yesterday" | "Previous 7 Days";

export interface GroupedSessions {
  label: SessionGroupLabel;
  sessions: SessionWithPreview[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseSessionDate(sessionDate: string): Date {
  return new Date(sessionDate);
}

/**
 * Group sessions into "Today", "Yesterday", "Previous 7 Days" (like ChatGPT/Claude).
 */
export function groupSessionsByDate(sessions: SessionWithPreview[]): GroupedSessions[] {
  const now = new Date();
  const todayKey = toDateKey(now);
  const yesterday = new Date(now.getTime() - MS_PER_DAY);
  const yesterdayKey = toDateKey(yesterday);
  const sevenDaysAgo = new Date(now.getTime() - 7 * MS_PER_DAY);

  const today: SessionWithPreview[] = [];
  const yesterdayList: SessionWithPreview[] = [];
  const previous: SessionWithPreview[] = [];

  for (const s of sessions) {
    const d = parseSessionDate(s.session_date);
    const key = toDateKey(d);
    if (key === todayKey) today.push(s);
    else if (key === yesterdayKey) yesterdayList.push(s);
    else if (d >= sevenDaysAgo) previous.push(s);
  }

  const result: GroupedSessions[] = [];
  if (today.length) result.push({ label: "Today", sessions: today });
  if (yesterdayList.length) result.push({ label: "Yesterday", sessions: yesterdayList });
  if (previous.length) result.push({ label: "Previous 7 Days", sessions: previous });

  return result;
}
