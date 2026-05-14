import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "movie";
  const query = searchParams.get("query") ?? "";

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY not configured" }, { status: 503 });
  }

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const endpoint = type === "tv"
    ? `https://api.themoviedb.org/3/search/tv`
    : `https://api.themoviedb.org/3/search/movie`;

  try {
    const res = await fetch(`${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "TMDB API error" }, { status: res.status });
    }

    const data = await res.json() as { results: unknown[] };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch from TMDB" }, { status: 500 });
  }
}
