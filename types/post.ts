export interface Post {
  id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  user_id: number;
  parent_id?: number;
  parent?: any;
  author: PostAuthor;
  _count: PostCount;
}

export interface PostCount {
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
