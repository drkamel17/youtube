"use client";

import { useState } from "react";
import type { Video, Playlist } from "@/types/database";
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

  const [showPicker, setShowPicker] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [msg, setMsg] = useState("");

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

  async function openPicker() {
    setMsg("");
    const { data } = await supabase.from("playlists").select("*").eq("user_id", userId).order("created_at");
    setPlaylists(data ?? []);
    setShowPicker(true);
  }

  async function addToPlaylist(playlistId: number) {
    const { error } = await supabase.from("playlist_videos").insert({ playlist_id: playlistId, video_id: video.id });
    if (error) {
      if (error.code === "23505") setMsg("Déjà dans cette playlist");
      else setMsg(error.message);
    } else {
      setMsg("Ajoutée !");
    }
    setTimeout(() => setShowPicker(false), 800);
  }

  async function remove() {
    if (!confirm("Supprimer cette vidéo ?")) return;
    await supabase.from("videos").delete().eq("id", video.id);
    onDelete?.(video.id);
  }

  return (
    <div className="card bg-zinc-900 rounded-xl overflow-hidden relative" data-id={video.id}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full aspect-video"
        allowFullScreen
      />
      <div className="p-3">
        <h3 className="font-semibold truncate">{video.title}</h3>
        <div className="flex gap-2 mt-2">
          <div className="relative">
            <button onClick={openPicker} className="text-sm px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700">
              + Playlist
            </button>
            {showPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                <div className="absolute left-0 top-full mt-1 w-56 bg-zinc-800 rounded-xl shadow-lg z-50 p-2">
                {msg ? (
                  <p className="text-sm text-zinc-300 p-2">{msg}</p>
                ) : (
                  <>
                    <p className="text-xs text-zinc-400 px-2 pb-1">Ajouter à…</p>
                    {playlists.length === 0 ? (
                      <p className="text-sm text-zinc-500 p-2">Aucune playlist</p>
                    ) : (
                      playlists.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addToPlaylist(p.id)}
                          className="w-full text-left p-2 rounded text-sm hover:bg-zinc-700"
                        >
                          {p.name}
                        </button>
                      ))
                    )}
                  </>
                )}
              </div>
              </>
            )}
          </div>
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
