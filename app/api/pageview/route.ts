import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { page } = await req.json();
  if (!page) return NextResponse.json({ error: "missing page" }, { status: 400 });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(req.headers.get("authorization")?.replace("Bearer ", "") ?? "");

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await supabaseAdmin.from("page_views").insert({ user_id: user.id, page });

  return NextResponse.json({ success: true });
}
