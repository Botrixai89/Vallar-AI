/**
 * Format a session date as relative time for sidebar: "2h ago", "Yesterday", "Mon 3:42 PM", etc.
 */
export function formatRelativeTime(sessionDateIso: string): string {
  const d = new Date(sessionDateIso);
  const now = new Date();
  const ms = now.getTime() - d.getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24 && d.getDate() === now.getDate()) return `${hours}h ago`;
  if (days === 1 || (days < 2 && hours >= 24)) return "Yesterday";
  if (days < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
