"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getUserRole } from "@/lib/permissions";

export default function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarContent />
    </Suspense>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const isFavPage = pathname === "/dashboard" && searchParams.get("fav") === "1";

  useEffect(() => {
    getUserRole().then(setRole);
  }, []);

  const isAdmin = role === "admin";

  const isActive = (href: string) => {
    if (href === "/dashboard?fav=1") return isFavPage;
    return pathname === href;
  };

  const links = [
    { href: "/dashboard", label: "Dashboard", adminOnly: false },
    { href: "/videos/add", label: "Ajouter vidéo", adminOnly: true },
    { href: "/categories", label: "Catégories", adminOnly: true },
    { href: "/dashboard?fav=1", label: "★ Favoris", adminOnly: false },
    { href: "/duplicates", label: "🔍 Doublons", adminOnly: true },
    { href: "/stats", label: "Statistiques", adminOnly: true },
    { href: "/users", label: "Utilisateurs", adminOnly: true },
    { href: "/assign", label: "Assignation", adminOnly: true },
  ].filter((l) => !l.adminOnly || isAdmin);

  return (
    <aside className="w-64 bg-zinc-900 min-h-screen p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6">YouTube Library</h2>
      <nav className="flex flex-col gap-2 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`p-3 rounded ${
              isActive(link.href)
                ? "bg-red-600 text-white"
                : "hover:bg-zinc-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={async () => {
          await signOut();
          router.push("/login");
        }}
        className="p-3 rounded bg-zinc-800 hover:bg-zinc-700 mt-auto"
      >
        Déconnexion
      </button>
    </aside>
  );
}
