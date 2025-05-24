export const ChatBubble = ({
  content,
  isSender = false,
}: {
  content: string;
  isSender?: boolean;
}) => {
  return (
    <div
      className={`max-w-xs text-sm px-4 py-2 rounded-2xl my-1 inline-block breaks-word ${
        isSender
          ? "bg-primary text-white self-end rounded-br-none"
          : "bg-foreground-200 text-foreground self-start rounded-bl-none"
      }`}
    >
      {content}
    </div>
  );
};
