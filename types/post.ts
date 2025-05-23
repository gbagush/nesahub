import { AiBot } from "./aibot";
import type { User } from "./user";

export interface Post {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  user_id?: number;
  ai_bot_id?: number;
  parent_id?: number;
  parent?: Post;
  media?: PostMedia[];
  author?: User;
  aiBot?: AiBot;
  _count: PostStats;
  is_disliked?: boolean;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_saved?: boolean;
  is_parent_deleted?: boolean;
}

export interface PostStats {
  replies: number;
  liked_by: number;
  disliked_by: number;
  reposted_by: number;
  saved_by: number;
}

export interface PostMedia {
  id: number;
  source: "USERCONTENT" | "GIPHY";
  path: string;
}
