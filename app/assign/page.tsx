"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, Category, UserCategory } from "@/types/database";
import Sidebar from "@/components/Sidebar";

export default function AssignPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignments, setAssignments] = useState<UserCategory[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | "">("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      supabase
        .from("user_categories")
        .select("*")
        .eq("user_id", selectedUser)
        .then(({ data }) => setAssignments(data ?? []));
    }
  }, [selectedUser]);

  async function loadData() {
    const [usersRes, catsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("username"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setUsers(usersRes.data ?? []);
    setCategories(catsRes.data ?? []);
  }

  async function toggleCategory(categoryId: number) {
    if (!selectedUser) return;
    const exists = assignments.find((a) => a.category_id === categoryId);
    if (exists) {
      await supabase
        .from("user_categories")
        .delete()
        .eq("user_id", selectedUser)
        .eq("category_id", categoryId);
      setAssignments((prev) => prev.filter((a) => a.category_id !== categoryId));
    } else {
      await supabase.from("user_categories").insert({
        user_id: selectedUser,
        category_id: categoryId,
      });
      setAssignments((prev) => [...prev, { user_id: selectedUser, category_id: categoryId }]);
    }
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Assignation catégories</h1>
        <select
          className="w-full p-3 mb-4 rounded bg-zinc-800"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Sélectionner un utilisateur</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        {selectedUser && (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const isAssigned = assignments.some((a) => a.category_id === cat.id);
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-3 bg-zinc-900 p-3 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={() => toggleCategory(cat.id)}
                    className="accent-red-600"
                  />
                  {cat.name}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
