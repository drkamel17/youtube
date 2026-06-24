"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Playlist } from "@/types/database";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

function extractPlaylistId(url: string): string | null {
  const m = url.match(/[?&]list=([^&]+)/);
  return m ? m[1] : null;
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<Playlist | null>(null);
  const [videos, setVideos] = useState<{ videoId: string; title: string }[]>([]);
  const [ytUrl, setYtUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const user = await getCurrentUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("playlists").select("*").eq("user_id", user.id).order("created_at");
    setPlaylists(data ?? []);
    setLoading(false);
  }

  async function addPlaylist() {
    setError("");
    const playlistId = extractPlaylistId(ytUrl);
    if (!playlistId) { setError("URL YouTube invalide"); return; }

    const user = await getCurrentUser();
    if (!user) return;

    setFetching(true);
    try {
      const res = await fetch(`/api/playlist-fetch?playlistId=${playlistId}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error); setFetching(false); return; }

      await supabase.from("playlists").insert({
        name: data.name,
        user_id: user.id,
        youtube_playlist_id: playlistId,
      });
      setYtUrl("");
      load();
    } catch {
      setError("Erreur lors de la récupération");
    }
    setFetching(false);
  }

  async function removePlaylist(id: number) {
    if (!confirm("Supprimer cette playlist ?")) return;
    await supabase.from("playlists").delete().eq("id", id);
    if (selected?.id === id) { setSelected(null); setVideos([]); }
    load();
  }

  async function selectPlaylist(p: Playlist) {
    setSelected(p);
    setError("");

    if (!p.youtube_playlist_id) { setVideos([]); return; }

    setFetching(true);
    try {
      const res = await fetch(`/api/playlist-fetch?playlistId=${p.youtube_playlist_id}`);
      const data = await res.json();
      if (res.ok) setVideos(data.videos ?? []);
      else setError(data.error);
    } catch {
      setError("Erreur de chargement");
    }
    setFetching(false);
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <div className="flex gap-6">
            <div className="w-72 shrink-0">
              <h2 className="text-lg font-bold mb-4">Playlists YouTube</h2>
              <div className="flex gap-2 mb-4">
                <input
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  placeholder="Lien playlist YouTube…"
                  className="flex-1 bg-zinc-800 rounded px-3 py-2 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addPlaylist()}
                />
                <button
                  onClick={addPlaylist}
                  disabled={fetching}
                  className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 text-sm font-semibold"
                >
                  +
                </button>
              </div>
              {error && (
                <div className="mb-4 p-3 rounded bg-red-900/50 text-red-300 text-sm border border-red-700">
                  {error}
                </div>
              )}
              {loading ? (
                <p className="text-zinc-500 text-sm">Chargement…</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {playlists.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <button
                        onClick={() => selectPlaylist(p)}
                        className={`flex-1 text-left p-3 rounded text-sm truncate ${
                          selected?.id === p.id ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      >
                        {p.name}
                      </button>
                      <button onClick={() => removePlaylist(p.id)} className="p-2 text-zinc-500 hover:text-red-400 text-sm">
                        ✕
                      </button>
                    </div>
                  ))}
                  {playlists.length === 0 && (
                    <p className="text-zinc-500 text-sm">Ajoute une playlist YouTube.</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1">
              {selected ? (
                fetching ? (
                  <p className="text-zinc-500">Chargement des vidéos…</p>
                ) : videos.length === 0 ? (
                  <p className="text-zinc-500">Cette playlist est vide.</p>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold mb-4">{selected.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((v) => (
                        <div key={v.videoId} className="bg-zinc-900 rounded-xl overflow-hidden">
                          <iframe
                            src={`https://www.youtube.com/embed/${v.videoId}`}
                            className="w-full aspect-video"
                            allowFullScreen
                          />
                          <div className="p-3">
                            <h3 className="font-semibold truncate">{v.title}</h3>
                            <a
                              href={`https://youtu.be/${v.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-zinc-500 hover:text-zinc-300"
                            >
                              Voir sur YouTube
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
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
