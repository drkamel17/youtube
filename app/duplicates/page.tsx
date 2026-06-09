"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Video } from "@/types/database";
import Sidebar from "@/components/Sidebar";

type Group = {
  url: string;
  videos: Video[];
};

export default function DuplicatesPage() {
  const [groups, setGroups] = useState<Group[]>([]);

  function getVideoId(url: string): string {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
      return u.searchParams.get("v") ?? url;
    } catch {
      return url;
    }
  }

  useEffect(() => {
    loadDuplicates();
  }, []);

  async function loadDuplicates() {
    const { data } = await supabase.from("videos").select("*").order("id");
    if (!data) return;

    const map = new Map<string, Video[]>();
    for (const v of data) {
      const id = getVideoId(v.youtube_url);
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(v);
    }

    const gs: Group[] = [];
    for (const [, videos] of map) {
      if (videos.length > 1) gs.push({ url: videos[0].youtube_url, videos });
    }
    gs.sort((a, b) => b.videos.length - a.videos.length);
    setGroups(gs);
  }

  async function removeOne(id: number) {
    await supabase.from("videos").delete().eq("id", id);
    loadDuplicates();
  }

  async function removeAllGroup(url: string) {
    const group = groups.find((g) => g.url === url);
    if (!group || group.videos.length < 2) return;
    const keep = group.videos.reduce((a, b) => (a.id < b.id ? a : b));
    for (const v of group.videos) {
      if (v.id !== keep.id) {
        await supabase.from("videos").delete().eq("id", v.id);
      }
    }
    loadDuplicates();
  }

  async function removeAllDuplicates() {
    for (const group of groups) {
      const keep = group.videos.reduce((a, b) => (a.id < b.id ? a : b));
      for (const v of group.videos) {
        if (v.id !== keep.id) {
          await supabase.from("videos").delete().eq("id", v.id);
        }
      }
    }
    loadDuplicates();
  }

  const totalDuplicates = groups.reduce((s, g) => s + g.videos.length - 1, 0);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            🔍 Doublons
            {totalDuplicates > 0 && (
              <span className="text-sm text-zinc-400 ml-2">({totalDuplicates} doublons)</span>
            )}
          </h1>
          {groups.length > 0 && (
            <button
              onClick={removeAllDuplicates}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 font-semibold"
            >
              Supprimer tous les doublons
            </button>
          )}
        </div>

        {groups.length === 0 && (
          <p className="text-zinc-500">Aucun doublon trouvé.</p>
        )}

        {groups.map((group) => {
          const keep = group.videos.reduce((a, b) => (a.id < b.id ? a : b));
          return (
            <div key={group.url} className="bg-zinc-900 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-400 truncate flex-1 mr-2">
                  {group.url} <span className="text-zinc-600">({group.videos.length}x)</span>
                </span>
                <button
                  onClick={() => removeAllGroup(group.url)}
                  className="text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                >
                  Supprimer les doublons
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {group.videos.map((v) => (
                  <div
                    key={v.id}
                    className={`flex items-center justify-between p-3 rounded ${v.id === keep.id ? "bg-zinc-800 border border-green-700" : "bg-zinc-800/50"}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium truncate">{v.title}</span>
                      {v.id === keep.id && (
                        <span className="text-xs text-green-500">gardé</span>
                      )}
                    </div>
                    {v.id !== keep.id && (
                      <button
                        onClick={() => removeOne(v.id)}
                        className="text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700 flex-shrink-0"
                      >
                        🗑 Supprimer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
