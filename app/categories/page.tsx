"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types/database";
import Sidebar from "@/components/Sidebar";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data ?? []);
  }

  async function addCategory() {
    if (!name) return;
    await supabase.from("categories").insert({ name });
    setName("");
    loadCategories();
  }

  async function deleteCategory(id: number) {
    await supabase.from("categories").delete().eq("id", id);
    loadCategories();
  }

  async function saveEdit(id: number) {
    if (!editName) return;
    await supabase.from("categories").update({ name: editName }).eq("id", id);
    setEditId(null);
    loadCategories();
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Catégories</h1>
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 p-3 rounded bg-zinc-800"
            placeholder="Nouvelle catégorie"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={addCategory} className="bg-red-600 px-4 rounded font-semibold hover:bg-red-700">
            Ajouter
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded">
              {editId === cat.id ? (
                <input
                  className="flex-1 p-2 rounded bg-zinc-700 mr-2"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                <span>{cat.name}</span>
              )}
              <div className="flex gap-2">
                {editId === cat.id ? (
                  <>
                    <button onClick={() => saveEdit(cat.id)} className="text-sm text-green-500 hover:text-green-400">
                      Enregistrer
                    </button>
                    <button onClick={() => setEditId(null)} className="text-sm text-zinc-500 hover:text-zinc-400">
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                      className="text-sm text-blue-500 hover:text-blue-400"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-sm text-red-500 hover:text-red-400"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
