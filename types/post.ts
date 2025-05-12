import type { User } from "./user";

export interface Post {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  user_id: number;
  parent_id?: number;
  parent?: Post;
  author: User;
  _count: PostStats;
  is_disliked?: boolean;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_saved?: boolean;
}

export interface PostStats {
  replies: number;
  liked_by: number;
  disliked_by: number;
  reposted_by: number;
  saved_by: number;
}
