"use client";

import type { Video } from "@/types/database";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Props = {
  video: Video;
  onDelete?: (id: number) => void;
};

export default function VideoCard({ video, onDelete }: Props) {
  const videoId = video.youtube_url.includes("v=")
    ? new URL(video.youtube_url).searchParams.get("v")
    : video.youtube_url.split("/").pop();

  async function toggleFavorite() {
    await supabase
      .from("videos")
      .update({ favorite: !video.favorite })
      .eq("id", video.id);
  }

  async function remove() {
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
          <button onClick={toggleFavorite} className="text-sm px-2 py-1 rounded bg-zinc-800">
            {video.favorite ? "★" : "☆"}
          </button>
          <Link href={`/videos/${video.id}/edit`} className="text-sm px-2 py-1 rounded bg-zinc-800">
            Modifier
          </Link>
          <button onClick={remove} className="text-sm px-2 py-1 rounded bg-red-600">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
