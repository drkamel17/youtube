"use client";

import type { Category } from "@/types/database";

type Props = {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
};

export default function CategoryBar({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-4">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded ${selected === null ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
      >
        Toutes
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-2 rounded ${selected === cat.id ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
