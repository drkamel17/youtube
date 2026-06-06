"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, getProfile } from "@/lib/auth";
import type { Profile } from "@/types/database";

export default function Header() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user) {
        const p = await getProfile(user.id);
        setProfile(p);
        setUsername(p?.username ?? "");
      }
    })();
  }, []);

  async function save() {
    setMsg("");
    const user = await getCurrentUser();
    if (!user) return;

    if (username !== profile?.username) {
      await supabase.from("profiles").update({ username }).eq("id", user.id);
    }
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { setMsg(error.message); return; }
    }
    setProfile((prev) => prev ? { ...prev, username } : prev);
    setNewPassword("");
    setMsg("Modifications enregistrées");
  }

  return (
    <header className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
      <h1 className="text-xl font-bold">Dashboard</h1>
      {profile && (
        <div className="relative">
          {profile.role === "admin" ? (
            <button onClick={() => setOpen(!open)} className="text-sm text-zinc-400 hover:text-zinc-200">
              {profile.username} ({profile.role})
            </button>
          ) : (
            <span className="text-sm text-zinc-400">
              {profile.username} ({profile.role})
            </span>
          )}
          {open && (
            <div className="absolute right-0 top-8 w-72 bg-zinc-800 rounded-xl p-4 shadow-lg z-50">
              <h2 className="font-bold mb-3">Mon compte</h2>
              <input
                className="w-full p-2 mb-2 rounded bg-zinc-700 text-white"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                className="w-full p-2 mb-2 rounded bg-zinc-700 text-white"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                onClick={save}
                className="w-full p-2 rounded bg-red-600 hover:bg-red-700 font-semibold"
              >
                Enregistrer
              </button>
              {msg && <p className="text-sm text-zinc-400 mt-2">{msg}</p>}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
