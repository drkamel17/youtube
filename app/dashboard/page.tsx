"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Video, Category } from "@/types/database";
import { getUserRole, getAllowedCategories } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/auth";
import VideoCard from "@/components/VideoCard";
import CategoryBar from "@/components/CategoryBar";
import SearchBar from "@/components/SearchBar";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Sortable from "sortablejs";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-black text-white items-center justify-center">Chargement…</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const showFav = searchParams.get("fav") === "1";

  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!gridRef.current || !isAdmin) return;
    const sortable = new Sortable(gridRef.current, {
      animation: 150,
      onEnd: async () => {
        const cards = [...document.querySelectorAll<HTMLElement>(".card")];
        for (let i = 0; i < cards.length; i++) {
          await supabase
            .from("videos")
            .update({ position: i })
            .eq("id", Number(cards[i].dataset.id));
        }
      },
    });
    return () => sortable.destroy();
  }, [videos, isAdmin]);

  async function init() {
    const user = await getCurrentUser();
    if (!user) return;

    const role = await getUserRole();
    setIsAdmin(role === "admin");

    let query = supabase.from("videos").select("*");

    if (role !== "admin") {
      const allowed = await getAllowedCategories(user.id);
      if (allowed.length > 0) {
        query = query.in("category_id", allowed);
        const { data: cats } = await supabase.from("categories").select("*").in("id", allowed).order("name");
        setCategories(cats ?? []);
      } else {
        setVideos([]);
        return;
      }
    } else {
      const { data: cats } = await supabase.from("categories").select("*").order("name");
      setCategories(cats ?? []);
    }

    query = query.order("position");
    const { data: vids } = await query;
    setVideos(vids ?? []);

    const { data: favs } = await supabase.from("user_favorites").select("video_id").eq("user_id", user.id);
    setFavoriteIds(new Set(favs?.map((f) => f.video_id) ?? []));
  }

  useEffect(() => {
    setPage(0);
  }, [selectedCategory, search, showFav]);

  const filtered = videos.filter((v) => {
    if (selectedCategory && v.category_id !== selectedCategory) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (showFav && !favoriteIds.has(v.id)) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  const videoCounts: Record<number, number> = {};
  videos.forEach((v) => { videoCounts[v.category_id] = (videoCounts[v.category_id] ?? 0) + 1; });

  function exportCSV(categoryId: number | "all") {
    const data = categoryId === "all" ? filtered : videos.filter((v) => v.category_id === categoryId);

    const catName = (id: number) => categories.find((c) => c.id === id)?.name ?? "";
    const headers = "Titre,URL YouTube,Catégorie";
    const rows = data.map((v) =>
      `"${v.title}",${v.youtube_url},"${catName(v.category_id)}"`
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `videos_${categoryId === "all" ? "toutes" : `cat${categoryId}`}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    setShowExport(false);
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <CategoryBar
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            counts={videoCounts}
            showAll={isAdmin}
          />
          <SearchBar value={search} onChange={setSearch} />
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Par page :</span>
              {[20, 30, 40, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => { setPerPage(n); setPage(0); }}
                  className={`px-3 py-1 rounded text-sm ${perPage === n ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowExport(true)}
                className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-sm font-semibold"
              >
                Exporter CSV
              </button>
            )}
          </div>
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isFav={favoriteIds.has(video.id)}
                isAdmin={isAdmin}
                onDelete={(id) => setVideos((prev) => prev.filter((v) => v.id !== id))}
                onToggleFav={(id, fav) =>
                  setFavoriteIds((prev) => {
                    const next = new Set(prev);
                    if (fav) next.add(id); else next.delete(id);
                    return next;
                  })
                }
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40"
              >
                ←
              </button>
              <span className="px-4 py-2 text-sm text-zinc-400">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}

          {showExport && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-zinc-900 rounded-xl p-6 w-80">
                <h3 className="text-lg font-bold mb-4">Exporter en CSV</h3>
                <p className="text-sm text-zinc-400 mb-4">Choisir les vidéos à exporter :</p>
                <button
                  onClick={() => exportCSV("all")}
                  className="w-full p-3 rounded bg-green-700 hover:bg-green-600 font-semibold mb-2"
                >
                  Toutes les vidéos
                </button>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto mb-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => exportCSV(cat.id)}
                      className="w-full p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm text-left"
                    >
                      {cat.name} ({videos.filter((v) => v.category_id === cat.id).length})
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowExport(false)}
                  className="w-full p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
