const TypingIndicator = () => (
  <div className="flex items-center gap-3 self-start max-w-[85%]">
    <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
      <span className="text-primary text-xs font-bold">V</span>
    </div>
    <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce-dot-1" />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce-dot-2" />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce-dot-3" />
    </div>
  </div>
);

export default TypingIndicator;
