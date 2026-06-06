import { supabase } from "./supabase";
import { getCurrentUser, getProfile } from "./auth";

export async function getUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getProfile(user.id);
  return profile?.role ?? "user";
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "admin";
}

export async function getAllowedCategories(userId: string) {
  const { data } = await supabase
    .from("user_categories")
    .select("category_id")
    .eq("user_id", userId);
  return data?.map((uc) => uc.category_id) ?? [];
}
