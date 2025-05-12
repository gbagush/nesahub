export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  profile_pict: string;
  created_at: string;
  _count?: UserStats;
  is_followed?: boolean;
}

export interface UserStats {
  followers: number;
  following: number;
  posts: number;
}
