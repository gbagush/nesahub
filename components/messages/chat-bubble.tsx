import { format } from "date-fns";

export const ChatBubble = ({
  content,
  created_at,
  isSender = false,
}: {
  content: string;
  created_at: Date;
  isSender?: boolean;
}) => {
  const formattedTime = format(new Date(created_at), "HH:mm");

  const isShortContent = content.length < 30 && !content.includes("\n");

  return (
    <div
      className={`max-w-xs text-sm px-4 py-2 rounded-2xl my-1 inline-block break-words ${
        isSender
          ? "bg-primary text-white self-end rounded-br-none"
          : "bg-foreground-200 text-foreground self-start rounded-bl-none"
      }`}
    >
      {isShortContent ? (
        <div className="flex items-baseline gap-1 flex-row">
          <div className="whitespace-pre-wrap flex-1">{content}</div>
          <div className="text-[9px] opacity-70 shrink-0 leading-none">
            {formattedTime}
          </div>
        </div>
      ) : (
        <>
          <div className="whitespace-pre-wrap">{content}</div>
          <div
            className={`mt-1 text-[9px] opacity-70 ${
              isSender ? "text-right" : "text-left"
            }`}
          >
            {formattedTime}
          </div>
        </>
      )}
    </div>
  );
};
