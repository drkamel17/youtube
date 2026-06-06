"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getProfile } from "@/lib/auth";
import type { Profile } from "@/types/database";

export default function Header() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (user) {
        const p = await getProfile(user.id);
        setProfile(p);
      }
    })();
  }, []);

  return (
    <header className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
      <h1 className="text-xl font-bold">Dashboard</h1>
      {profile && (
        <span className="text-sm text-zinc-400">
          {profile.username} ({profile.role})
        </span>
      )}
    </header>
  );
}
