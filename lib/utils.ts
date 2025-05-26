import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Post } from "@/types/post";

export const serializePost = (postData: any): Post => {
  return {
    ...postData,
    created_at: postData.created_at.toISOString(),
    updated_at: postData.updated_at
      ? postData.updated_at.toISOString()
      : undefined,
    deleted_at: postData.deleted_at
      ? postData.deleted_at.toISOString()
      : undefined,
    parent_id: postData.parent_id || undefined,
    user_id: postData.user_id ?? undefined,
    ai_bot_id: postData.ai_bot_id ?? undefined,
  };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
