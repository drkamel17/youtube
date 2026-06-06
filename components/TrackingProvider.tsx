"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/trackPageView";
import { supabase } from "@/lib/supabase";

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tracked = useRef<string>("");

  useEffect(() => {
    if (pathname === tracked.current) return;
    tracked.current = pathname;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") return;

      await trackPageView(pathname);
    })();
  }, [pathname]);

  return <>{children}</>;
}
