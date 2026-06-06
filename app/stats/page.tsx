"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type UserStat = {
  user_id: string;
  username: string;
  total: number;
  days: { date: string; count: number }[];
};

type PageStat = {
  page: string;
  total: number;
};

export default function StatsPage() {
  const [users, setUsers] = useState<UserStat[]>([]);
  const [pages, setPages] = useState<PageStat[]>([]);
  const [range, setRange] = useState(7);

  useEffect(() => {
    loadStats();
  }, [range]);

  async function loadStats() {
    const since = new Date();
    since.setDate(since.getDate() - range);

    const { data: views } = await supabase
      .from("page_views")
      .select("user_id, page, visited_at")
      .gte("visited_at", since.toISOString());

    if (!views) return;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username");

    const profileMap = new Map(profiles?.map((p) => [p.id, p.username]) ?? []);

    // per user
    const userMap = new Map<string, { total: number; dateMap: Map<string, number> }>();
    // per page
    const pageMap = new Map<string, number>();

    for (const v of views) {
      if (!userMap.has(v.user_id)) {
        userMap.set(v.user_id, { total: 0, dateMap: new Map() });
      }
      const u = userMap.get(v.user_id)!;
      u.total++;
      const day = v.visited_at.slice(0, 10);
      u.dateMap.set(day, (u.dateMap.get(day) ?? 0) + 1);

      pageMap.set(v.page, (pageMap.get(v.page) ?? 0) + 1);
    }

    const userStats: UserStat[] = [];
    for (const [id, data] of userMap) {
      const days: { date: string; count: number }[] = [];
      for (const [date, count] of data.dateMap) {
        days.push({ date, count });
      }
      days.sort((a, b) => a.date.localeCompare(b.date));
      userStats.push({
        user_id: id,
        username: profileMap.get(id) ?? "inconnu",
        total: data.total,
        days,
      });
    }
    userStats.sort((a, b) => b.total - a.total);

    const pageStats: PageStat[] = [];
    for (const [page, total] of pageMap) {
      pageStats.push({ page, total });
    }
    pageStats.sort((a, b) => b.total - a.total);

    setUsers(userStats);
    setPages(pageStats);
  }

  function maxCount(days: { date: string; count: number }[]) {
    return Math.max(...days.map((d) => d.count), 1);
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Statistiques</h1>
          <div className="flex gap-2">
            {[7, 30].map((n) => (
              <button
                key={n}
                onClick={() => setRange(n)}
                className={`px-4 py-2 rounded ${range === n ? "bg-red-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
              >
                {n} jours
              </button>
            ))}
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-3">Vues par utilisateur</h2>
        <div className="flex flex-col gap-3 mb-8">
          {users.map((u) => {
            const m = maxCount(u.days);
            return (
              <div key={u.user_id} className="bg-zinc-900 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{u.username}</span>
                  <span className="text-zinc-400">{u.total} vues</span>
                </div>
                <div className="flex items-end gap-[2px] h-10">
                  {u.days.map((d) => (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.count}`}
                      className="w-4 bg-red-600 rounded-t"
                      style={{ height: `${(d.count / m) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="text-zinc-500 text-sm">Aucune donnée pour cette période.</p>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-3">Vues par page</h2>
        <div className="flex flex-col gap-2">
          {pages.map((p) => (
            <div key={p.page} className="flex justify-between bg-zinc-900 p-3 rounded">
              <span>{p.page}</span>
              <span className="text-zinc-400">{p.total}</span>
            </div>
          ))}
          {pages.length === 0 && (
            <p className="text-zinc-500 text-sm">Aucune donnée pour cette période.</p>
          )}
        </div>
      </div>
    </div>
  );
}
