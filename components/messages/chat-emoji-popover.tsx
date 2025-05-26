"use client";
import dynamic from "next/dynamic";

import { useTheme } from "next-themes";

import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Smile } from "lucide-react";

import type { Theme } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export const ChatEmojiPopover = ({
  onEmojiClick,
}: {
  onEmojiClick: (emoji: string) => void;
}) => {
  const { theme } = useTheme();

  return (
    <Popover placement="top-start" classNames={{ content: "p-0 border-0" }}>
      <PopoverTrigger>
        <button>
          <Smile size={20} />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <EmojiPicker
          theme={theme === "dark" ? ("dark" as Theme) : ("light" as Theme)}
          onEmojiClick={(emoji) => onEmojiClick(emoji.emoji)}
        />
      </PopoverContent>
    </Popover>
  );
};
