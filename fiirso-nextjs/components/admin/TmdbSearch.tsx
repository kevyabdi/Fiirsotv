"use client";

import { useState } from "react";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface TmdbResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
}

interface TmdbSearchProps {
  type: "movie" | "tv";
  onSelect: (data: Record<string, unknown>) => void;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/original";

export function TmdbSearch({ type, onSelect }: TmdbSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tmdb?type=${type}&query=${encodeURIComponent(query)}`);
      if (!res.ok) { setError("TMDB search failed — check your TMDB_API_KEY"); return; }
      const data = await res.json() as { results: TmdbResult[] };
      setResults(data.results?.slice(0, 8) ?? []);
    } catch { setError("Failed to search TMDB"); }
    finally { setIsLoading(false); }
  };

  const handleSelect = (item: TmdbResult) => {
    const title = item.title ?? item.name ?? "";
    const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
    const genre = GENRE_MAP[item.genre_ids?.[0]] ?? "Drama";
    const rating = item.vote_average ? String(item.vote_average.toFixed(1)) : "";
    const poster_url = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : "";
    const backdrop_url = item.backdrop_path ? `${TMDB_BACKDROP}${item.backdrop_path}` : "";

    onSelect({ title, year, genre, rating, description: item.overview, poster_url, backdrop_url });
    setResults([]);
    setQuery("");
  };

  return (
    <Card className="rounded-2xl border-card-border">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold">Import from TMDB</p>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={`Search ${type === "movie" ? "movies" : "TV series"} on TMDB…`}
            className="rounded-xl"
          />
          <Button type="button" onClick={handleSearch} disabled={isLoading} className="rounded-xl shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {results.map(item => (
              <button key={item.id} type="button" onClick={() => handleSelect(item)}
                className="relative group rounded-xl overflow-hidden aspect-[2/3] bg-muted hover:ring-2 hover:ring-primary transition-all">
                {item.poster_path ? (
                  <img src={`${TMDB_IMG}${item.poster_path}`} alt={item.title ?? item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground/30 text-xs px-1 text-center">{item.title ?? item.name}</div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                  <ExternalLink className="h-4 w-4 text-white" />
                  <span className="text-[10px] text-white font-medium text-center line-clamp-2">{item.title ?? item.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
