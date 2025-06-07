import type { Post } from "./post";
import type { User } from "./user";

export interface Notification {
  id: number;
  recipient_id: number;
  type: "NEW_FOLLOWER" | "POST_REPLY" | "POST_MENTION" | "SYSTEM_MESSAGE";
  created_at: string;
  initiator_id?: number;
  post_id?: number;
  message?: string;
  initiator?: User;
  post?: Post;
}
