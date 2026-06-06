"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default function UsersPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const { error } = await signUp(email, password, username);
    if (error) {
      setMsg(`Erreur : ${error.message}`);
    } else {
      setMsg("Utilisateur créé avec succès !");
      setEmail("");
      setUsername("");
      setPassword("");
    }
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Ajouter un utilisateur</h1>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded bg-zinc-800"
          />
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
          <button type="submit" className="p-3 rounded bg-red-600 hover:bg-red-700 font-semibold">
            Ajouter
          </button>
          {msg && <p className="text-sm text-zinc-400">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
