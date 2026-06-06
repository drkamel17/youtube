"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types/database";
import Sidebar from "@/components/Sidebar";

export default function AddVideoPage() {
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

  async function handleSubmit() {
    if (!title || !youtubeUrl || categoryId === "") return;
    const { error } = await supabase.from("videos").insert({
      title,
      youtube_url: youtubeUrl,
      category_id: categoryId,
      position: 0,
    });
    if (!error) router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Ajouter une vidéo</h1>
        <input
          className="w-full p-3 mb-3 rounded bg-zinc-800"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full p-3 mb-3 rounded bg-zinc-800"
          placeholder="URL YouTube"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <select
          className="w-full p-3 mb-3 rounded bg-zinc-800"
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 p-3 rounded font-semibold hover:bg-red-700"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
