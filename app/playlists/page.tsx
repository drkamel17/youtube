"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Playlist, Video } from "@/types/database";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) return;
      const { data } = await supabase.from("playlists").select("*").eq("user_id", user.id).order("created_at");
      setPlaylists(data ?? []);
    })();
  }, []);

  async function create() {
    const user = await getCurrentUser();
    if (!user || !newName.trim()) return;
    await supabase.from("playlists").insert({ name: newName.trim(), user_id: user.id });
    setNewName("");
    const { data } = await supabase.from("playlists").select("*").eq("user_id", user.id).order("created_at");
    setPlaylists(data ?? []);
  }

  async function remove(id: number) {
    if (!confirm("Supprimer cette playlist ?")) return;
    const user = await getCurrentUser();
    if (!user) return;
    await supabase.from("playlists").delete().eq("id", id);
    if (selected === id) { setSelected(null); setVideos([]); }
    const { data } = await supabase.from("playlists").select("*").eq("user_id", user.id).order("created_at");
    setPlaylists(data ?? []);
  }

  async function selectPlaylist(id: number) {
    setSelected(id);
    const { data } = await supabase
      .from("playlist_videos")
      .select("video_id")
      .eq("playlist_id", id)
      .order("position");
    const ids = data?.map((pv) => pv.video_id) ?? [];
    if (ids.length === 0) { setVideos([]); return; }
    const { data: vids } = await supabase.from("videos").select("*").in("id", ids);
    setVideos(vids ?? []);
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <div className="flex gap-6">
            <div className="w-72 shrink-0">
              <h2 className="text-lg font-bold mb-4">Mes Playlists</h2>
              <div className="flex gap-2 mb-4">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nouvelle playlist…"
                  className="flex-1 bg-zinc-800 rounded px-3 py-2 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && create()}
                />
                <button onClick={create} className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-sm font-semibold">
                  +
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {playlists.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <button
                      onClick={() => selectPlaylist(p.id)}
                      className={`flex-1 text-left p-3 rounded text-sm ${
                        selected === p.id ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {p.name}
                    </button>
                    <button onClick={() => remove(p.id)} className="p-2 text-zinc-500 hover:text-red-400 text-sm">
                      ✕
                    </button>
                  </div>
                ))}
                {playlists.length === 0 && (
                  <p className="text-zinc-500 text-sm">Aucune playlist.</p>
                )}
              </div>
            </div>
            <div className="flex-1">
              {selected ? (
                videos.length === 0 ? (
                  <p className="text-zinc-500">Cette playlist est vide.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((v) => {
                      const videoId = v.youtube_url.includes("v=")
                        ? new URL(v.youtube_url).searchParams.get("v")
                        : v.youtube_url.split("/").pop();
                      return (
                        <div key={v.id} className="bg-zinc-900 rounded-xl overflow-hidden">
                          <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full aspect-video" allowFullScreen />
                          <div className="p-3">
                            <h3 className="font-semibold truncate">{v.title}</h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <p className="text-zinc-500">Sélectionne une playlist.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
