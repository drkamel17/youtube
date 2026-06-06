"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Video, Category } from "@/types/database";
import Sidebar from "@/components/Sidebar";

export default function EditVideoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      setCategories(data ?? []);
    });
    supabase.from("videos").select("*").eq("id", Number(id)).single().then(({ data }) => {
      if (data) {
        setTitle(data.title);
        setYoutubeUrl(data.youtube_url);
        setCategoryId(data.category_id);
      }
    });
  }, [id]);

  async function handleUpdate() {
    if (!title || !youtubeUrl || categoryId === "") return;
    const { error } = await supabase
      .from("videos")
      .update({ title, youtube_url: youtubeUrl, category_id: categoryId })
      .eq("id", Number(id));
    if (!error) router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Modifier la vidéo</h1>
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
          onClick={handleUpdate}
          className="w-full bg-red-600 p-3 rounded font-semibold hover:bg-red-700"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
