import { supabase } from "./supabase";

export async function trackPageView(page: string) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await fetch("/api/pageview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ page }),
    });
  } catch {
    // silent fail
  }
}
