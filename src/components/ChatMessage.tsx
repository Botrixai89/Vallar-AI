import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const [showTime, setShowTime] = useState(false);
  const isUser = role === "user";

  const timeStr = timestamp.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 ring-2 ring-indigo-500/20">
          <span className="text-indigo-400 text-xs font-semibold">You</span>
        </div>
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 ring-white/10"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          }}
        >
          <span className="text-white text-xs font-bold">V</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5 max-w-[85%]">
        <div
          className={
            isUser
              ? "px-4 py-3.5 rounded-2xl rounded-tr-none transition-all duration-200"
              : "px-4 py-3.5 rounded-2xl rounded-tl-none bg-card/80 border border-border/50 transition-all duration-200"
          }
          style={
            isUser
              ? {
                  background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 20px rgba(124, 110, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                }
              : {
                  borderLeft: "3px solid rgba(124, 110, 247, 0.3)",
                }
          }
        >
          {isUser ? (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-white">
              {content}
            </p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-[15px] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:my-1 [&>ol]:my-1">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        {showTime && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`text-[11px] text-muted-foreground ${isUser ? "text-right" : "text-left"}`}
          >
            {timeStr}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
