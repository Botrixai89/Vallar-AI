import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

const MAX_CHARS = 3000;

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;
  const canSend = text.trim().length > 0 && !isLoading && !overLimit;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [text]);

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-3 sm:px-4 safe-bottom">
      <div className="max-w-3xl mx-auto">
        <div
          data-chat-input-wrapper
          className="relative flex items-end gap-2 rounded-2xl p-2 transition-all duration-[250ms] ease-out"
          style={{
            backgroundColor: "hsl(234, 33%, 8%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[15px] text-foreground placeholder:text-muted-foreground px-3 py-2.5 min-h-[44px] max-h-[160px] scrollbar-none rounded-xl focus:ring-0"
          />
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleSend}
            disabled={!canSend}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-[250ms] ease-out ${
              canSend ? "send-glow-active text-white" : "bg-muted/50 text-muted-foreground"
            }`}
            style={
              canSend
                ? {
                    background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                    boxShadow: "0 0 16px rgba(124, 110, 247, 0.35)",
                  }
                : undefined
            }
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowUp size={18} />
            )}
          </motion.button>
        </div>

        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[11px] text-muted-foreground hidden sm:block">
            ↵ send · ⇧↵ new line
          </span>
          {charCount > 2800 && (
            <span
              className={`text-[11px] ${
                overLimit ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
