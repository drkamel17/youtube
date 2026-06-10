"use client";

import type { Video } from "@/types/database";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Props = {
  video: Video;
  isFav: boolean;
  userId: string | null;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
  onToggleFav?: (id: number, fav: boolean) => void;
};

export default function VideoCard({ video, isFav, userId, isAdmin, onDelete, onToggleFav }: Props) {
  const videoId = video.youtube_url.includes("v=")
    ? new URL(video.youtube_url).searchParams.get("v")
    : video.youtube_url.split("/").pop();

  async function toggleFavorite() {
    const newFav = !isFav;
    if (!userId) return;
    if (newFav) {
      const { error } = await supabase.from("user_favorites").insert({ user_id: userId, video_id: video.id });
      if (error) console.error("Fav insert error:", error.message);
    } else {
      const { error } = await supabase.from("user_favorites").delete().eq("user_id", userId).eq("video_id", video.id);
      if (error) console.error("Fav delete error:", error.message);
    }
    onToggleFav?.(video.id, newFav);
  }

  async function remove() {
    if (!confirm("Supprimer cette vidéo ?")) return;
    await supabase.from("videos").delete().eq("id", video.id);
    onDelete?.(video.id);
  }

  return (
    <div className="card bg-zinc-900 rounded-xl overflow-hidden" data-id={video.id}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full aspect-video"
        allowFullScreen
      />
      <div className="p-3">
        <h3 className="font-semibold truncate">{video.title}</h3>
        <div className="flex gap-2 mt-2">
          <button onClick={toggleFavorite} className="text-sm px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700">
            {isFav ? "★" : "☆"}
          </button>
          {isAdmin && (
            <>
              <Link href={`/videos/${video.id}/edit`} className="text-sm px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700">
                Modifier
              </Link>
              <button onClick={remove} className="text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700">
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
