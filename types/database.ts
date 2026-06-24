export type Category = {
  id: number;
  name: string;
  created_at: string;
};

export type Video = {
  id: number;
  title: string;
  youtube_url: string;
  category_id: number;
  favorite: boolean;
  position: number;
  created_at: string;
};

export type Profile = {
  id: string;
  username: string;
  role: "admin" | "user";
};

export type UserCategory = {
  user_id: string;
  category_id: number;
};

export type UserFavorite = {
  user_id: string;
  video_id: number;
  created_at: string;
};

export type PageView = {
  id: number;
  user_id: string;
  page: string;
  visited_at: string;
};

export type Playlist = {
  id: number;
  name: string;
  user_id: string;
  youtube_playlist_id: string | null;
  created_at: string;
};

export type PlaylistVideo = {
  playlist_id: number;
  video_id: number;
  position: number;
};
