import { motion } from "framer-motion";
import { Plus, LogOut, X } from "lucide-react";
import type { GroupedSessions } from "@/lib/sessionGroups";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

interface ChatSidebarProps {
  groupedSessions: GroupedSessions[];
  activeSessionDate: string | null;
  userEmail: string;
  onNewChat: () => void;
  onSelectSession: (sessionDate: string) => void;
  onLogout: () => void;
  onClose: () => void;
  isMobile: boolean;
}

const ChatSidebar = ({
  groupedSessions,
  activeSessionDate,
  userEmail,
  onNewChat,
  onSelectSession,
  onLogout,
  onClose,
  isMobile,
}: ChatSidebarProps) => {
  const initialLetter = userEmail ? userEmail[0].toUpperCase() : "?";

  return (
    <motion.aside
      initial={isMobile ? { x: "-100%" } : false}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-72 h-full bg-secondary/50 flex flex-col z-40 relative"
      style={{
        boxShadow: "2px 0 24px rgba(124, 110, 247, 0.15)",
        borderRight: "1px solid rgba(124, 110, 247, 0.15)",
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-lg font-bold tracking-[-0.05em] uppercase text-foreground">
              VALLAR
            </h1>
            <p className="text-[11px] text-muted-foreground tracking-wider uppercase mt-0.5">
              Your 3AM Buddy
            </p>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors duration-200"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-medium transition-all duration-200 ease-out hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(124,110,247,0.15)]"
        >
          <Plus size={16} className="text-indigo-400" />
          New Chat
        </button>
      </div>

      {/* Grouped sessions */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-3 space-y-5">
        {groupedSessions.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase font-medium">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-border/60" />
            </div>
            <div className="space-y-0.5">
              {group.sessions.map((s) => {
                const isActive = activeSessionDate === s.session_date;
                return (
                  <button
                    key={s.session_date}
                    onClick={() => onSelectSession(s.session_date)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-[250ms] ease-out border-l-[3px] border-transparent hover:bg-muted/40 hover:border-indigo-500/50 ${
                      isActive
                        ? "bg-indigo-500/15 border-l-indigo-500 text-indigo-200 font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: isActive
                          ? "rgb(129, 140, 248)"
                          : "rgba(124, 110, 247, 0.5)",
                      }}
                    />
                    <span className="flex-1 min-w-0 truncate">{s.preview}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatRelativeTime(s.session_date)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: email avatar + logout */}
      <div className="p-4 border-t border-border/50 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
        >
          {initialLetter}
        </div>
        <span className="text-xs text-muted-foreground truncate flex-1 min-w-0 font-medium">
          {userEmail}
        </span>
        <button
          onClick={onLogout}
          className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors duration-200"
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </motion.aside>
  );
};

export default ChatSidebar;
