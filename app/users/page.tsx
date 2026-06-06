"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";
import Sidebar from "@/components/Sidebar";

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("*").order("username").then(({ data }) => {
      setUsers(data ?? []);
    });
  }, []);

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole as "admin" | "user" } : u))
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Utilisateurs</h1>
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded">
              <div>
                <span className="font-semibold">{user.username}</span>
                <span className="text-sm text-zinc-500 ml-2">({user.role})</span>
              </div>
              <button
                onClick={() => toggleRole(user.id, user.role)}
                className="text-sm px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
              >
                Basculer rôle
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
