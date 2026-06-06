"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function UsersPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`Erreur : ${data.error}`);
      } else {
        setMsg("Utilisateur créé avec succès !");
        setUsername("");
        setPassword("");
      }
    } catch {
      setMsg("Erreur réseau");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Ajouter un utilisateur</h1>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="p-3 rounded bg-zinc-800"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 rounded bg-zinc-800"
          />
          <button type="submit" disabled={loading} className="p-3 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 font-semibold">
            {loading ? "Création..." : "Ajouter"}
          </button>
          {msg && <p className="text-sm text-zinc-400">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
