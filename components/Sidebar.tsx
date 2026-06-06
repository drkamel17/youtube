"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

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
  const isFavPage = pathname === "/dashboard" && searchParams.get("fav") === "1";

  const isActive = (href: string) => {
    if (href === "/dashboard?fav=1") return isFavPage;
    return pathname === href;
  };

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/videos/add", label: "Ajouter vidéo" },
    { href: "/categories", label: "Catégories" },
    { href: "/dashboard?fav=1", label: "★ Favoris" },
    { href: "/users", label: "Utilisateurs" },
    { href: "/assign", label: "Assignation" },
  ];

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
