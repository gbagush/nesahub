export const TypingIndicator = () => {
  return (
    <div className="max-w-xs px-4 py-4 rounded-2xl my-1 bg-foreground-200 text-foreground self-start rounded-bl-none inline-block">
      <div className="flex items-center gap-1">
        <TypingDots />
      </div>
    </div>
  );
};

const TypingDots = () => {
  return (
    <div className="flex space-x-1">
      <span className="w-1 h-1 bg-foreground rounded-full animate-bounce animation-delay-0"></span>
      <span className="w-1 h-1 bg-foreground rounded-full animate-bounce animation-delay-200"></span>
      <span className="w-1 h-1 bg-foreground rounded-full animate-bounce animation-delay-400"></span>
    </div>
  );
};
