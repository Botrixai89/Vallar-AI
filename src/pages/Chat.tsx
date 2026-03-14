import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, LogOut, Plus, ArrowDown, Settings } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ChatSidebar from "@/components/ChatSidebar";
import TypingIndicator from "@/components/TypingIndicator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchSessions,
  fetchConversation,
  insertMessage,
} from "@/lib/conversations";
import { ensureUserExists } from "@/lib/ensureUser";
import { groupSessionsByDate, type GroupedSessions } from "@/lib/sessionGroups";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hey, I'm VALLAR — your 3AM buddy. What's on your mind tonight?",
  timestamp: new Date(),
};

const Chat = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const userEmail = user?.email ?? "";

  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [activeSessionDate, setActiveSessionDate] = useState<string | null>(null);
  const [groupedSessions, setGroupedSessions] = useState<GroupedSessions[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!atBottom);
  };

  const refreshSessions = useCallback(async () => {
    if (!userEmail) return;
    setSessionsLoading(true);
    try {
      const list = await fetchSessions(userEmail);
      setGroupedSessions(groupSessionsByDate(list));
    } catch {
      setGroupedSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [userEmail]);

  // Ensure user exists in vallar_users on chat load (before first message)
  useEffect(() => {
    if (userEmail) ensureUserExists(userEmail);
  }, [userEmail]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const handleSelectSession = useCallback(
    async (sessionDate: string) => {
      if (!userEmail) return;
      setActiveSessionDate(sessionDate);
      setSessionsLoading(true);
      try {
        const rows = await fetchConversation(userEmail, sessionDate);
        const msgs: Message[] = rows.map((r, i) => ({
          id: `loaded-${sessionDate}-${i}`,
          role: r.role,
          content: r.content,
          timestamp: new Date(r.created_at),
        }));
        setMessages(msgs);
      } catch {
        setMessages([WELCOME_MSG]);
      } finally {
        setSessionsLoading(false);
      }
      setSidebarOpen(false);
    },
    [userEmail]
  );

  const sendMessage = async (text: string) => {
    if (!userEmail) return;

    let sessionDate = activeSessionDate;
    if (!sessionDate) {
      sessionDate = new Date().toISOString();
      setActiveSessionDate(sessionDate);
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      await insertMessage(userEmail, sessionDate, "user", text);

      const res = await fetch(
        "https://n8n.srv1126258.hstgr.cloud/webhook/vallar-chat-001/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: userEmail,
            action: "sendMessage",
            chatInput: text,
          }),
        }
      );

      const data = await res.json();
      const reply =
        data?.output ||
        (Array.isArray(data) && data[0]?.agentResponse) ||
        "I'm having a moment. Try again in a bit 💙";

      await insertMessage(userEmail, sessionDate, "assistant", reply);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      await refreshSessions();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I'm having a moment. Try again in a bit 💙",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionDate(null);
    setMessages([{ ...WELCOME_MSG, id: crypto.randomUUID(), timestamp: new Date() }]);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const dateLabel =
    activeSessionDate &&
    (() => {
      const d = new Date(activeSessionDate);
      const today = new Date();
      const isToday =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
      if (isToday) return "Today";
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    })();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="h-dvh flex bg-background overflow-hidden">
      <div className="hidden md:flex">
        <ChatSidebar
          groupedSessions={groupedSessions}
          activeSessionDate={activeSessionDate}
          userEmail={userEmail}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onLogout={handleLogout}
          onClose={() => setSidebarOpen(false)}
          isMobile={false}
        />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 md:hidden"
            />
            <div className="fixed inset-y-0 left-0 z-40 md:hidden">
              <ChatSidebar
                groupedSessions={groupedSessions}
                activeSessionDate={activeSessionDate}
                userEmail={userEmail}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onLogout={handleLogout}
                onClose={() => setSidebarOpen(false)}
                isMobile
              />
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header
          className="h-14 flex items-center justify-between px-4 shrink-0 sticky top-0 z-20 transition-colors duration-200"
          style={{
            backdropFilter: "blur(12px)",
            backgroundColor: "hsla(234, 33%, 4%, 0.82)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors duration-200"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 online-pulse" />
              <span className="text-sm text-muted-foreground">
                Online — ready to listen
              </span>
            </div>
            <span className="md:hidden text-sm font-bold tracking-[-0.04em] uppercase text-foreground">
              VALLAR
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            >
              <Plus size={14} />
              New
            </button>
            <button
              className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors duration-200"
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors duration-200"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-none relative"
        >
          {/* Subtle radial glow behind chat center */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{
              background: "radial-gradient(circle, rgba(124,110,247,0.2) 0%, transparent 70%)",
            }}
          />
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 relative">
            {/* Date divider: thin line + pill label */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[11px] text-muted-foreground tracking-widest uppercase bg-background px-4 py-1.5 rounded-full border border-border/50">
                {dateLabel ?? today}
              </span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            {/* Watermark when only welcome message (empty chat) */}
            {messages.length === 1 && messages[0].role === "assistant" && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                aria-hidden
              >
                <span
                  className="text-[clamp(4rem,12vw,8rem)] font-bold tracking-[0.2em] uppercase text-foreground"
                  style={{ opacity: 0.03 }}
                >
                  VALLAR
                </span>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-24 right-6 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center shadow-lg text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <ArrowDown size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input area: gradient fade + floating container */}
        <div className="relative shrink-0 pt-8 pb-4">
          <div
            className="absolute inset-x-0 top-0 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent, hsl(234, 33%, 4%))",
            }}
          />
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
