"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="Rechercher par titre..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 rounded bg-zinc-800 mb-4"
    />
  );
}
