"use client";

import { useEffect, useState, useRef } from "react";
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
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showFav, setShowFav] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

    setShowFav(window.location.search.includes("fav=1"));

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

  const filtered = videos.filter((v) => {
    if (selectedCategory && v.category_id !== selectedCategory) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (showFav && !v.favorite) return false;
    return true;
  });

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
          />
          <SearchBar value={search} onChange={setSearch} />
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={(id) => setVideos((prev) => prev.filter((v) => v.id !== id))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
