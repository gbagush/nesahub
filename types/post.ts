export interface Post {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  user_id: number;
  parent_id?: number;
  parent?: Post;
  author: PostAuthor;
  _count: PostCount;
  is_disliked?: boolean;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_saved?: boolean;
}

export interface PostCount {
  replies: number;
  liked_by: number;
  disliked_by: number;
  reposted_by: number;
  saved_by: number;
}

export interface PostAuthor {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_pict: string;
}
