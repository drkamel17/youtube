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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(0);
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

    const { data: cats } = await supabase.from("categories").select("*").order("name");
    setCategories(cats ?? []);

    let query = supabase.from("videos").select("*");

    if (role !== "admin") {
      const allowed = await getAllowedCategories(user.id);
      if (allowed.length > 0) {
        query = query.in("category_id", allowed);
      } else {
        setVideos([]);
        return;
      }
    }

    query = query.order("position");
    const { data: vids } = await query;
    setVideos(vids ?? []);
  }

  useEffect(() => {
    setPage(0);
  }, [selectedCategory, search, showFav]);

  const filtered = videos.filter((v) => {
    if (selectedCategory && v.category_id !== selectedCategory) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (showFav && !v.favorite) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  const videoCounts: Record<number, number> = {};
  videos.forEach((v) => { videoCounts[v.category_id] = (videoCounts[v.category_id] ?? 0) + 1; });

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
          />
          <SearchBar value={search} onChange={setSearch} />
          <div className="flex items-center gap-2 mb-4">
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
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isAdmin={isAdmin}
                onDelete={(id) => setVideos((prev) => prev.filter((v) => v.id !== id))}
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
        </div>
      </div>
    </div>
  );
}
