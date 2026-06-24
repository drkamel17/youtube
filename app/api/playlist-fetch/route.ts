import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get("playlistId");
  if (!playlistId) {
    return NextResponse.json({ error: "playlistId required" }, { status: 400 });
  }

  try {
    const rss = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`);
    if (!rss.ok) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }
    const xml = await rss.text();

    const videos: { videoId: string; title: string }[] = [];

    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
      if (videoId && title) {
        videos.push({ videoId, title });
      }
    }

    const name = xml.match(/<title>([^<]+)<\/title>/)?.[1] ?? "Playlist";

    return NextResponse.json({ name, videos });
  } catch {
    return NextResponse.json({ error: "Failed to fetch playlist" }, { status: 500 });
  }
}
