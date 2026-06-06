"use client";

import type { Category } from "@/types/database";

type Props = {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
  counts?: Record<number, number>;
};

export default function CategoryBar({ categories, selected, onSelect, counts }: Props) {
  const total = categories.reduce((s, c) => s + (counts?.[c.id] ?? 0), 0);

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded ${selected === null ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
      >
        Toutes ({total})
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-2 rounded ${selected === cat.id ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
        >
          {cat.name} ({counts?.[cat.id] ?? 0})
        </button>
      ))}
    </div>
  );
}
