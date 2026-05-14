"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Download, Film, Tv } from "lucide-react";

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

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  53: "Thriller", 10752: "War", 37: "Western",
};

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/original";

export default function ImportPage() {
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importing, setImporting] = useState<Set<number>>(new Set());
  const [imported, setImported] = useState<Set<number>>(new Set());
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/tmdb?type=${type}&query=${encodeURIComponent(query)}`);
      if (!res.ok) { toast({ title: "TMDB search failed — add TMDB_API_KEY to your .env.local", variant: "destructive" }); return; }
      const data = await res.json() as { results: TmdbResult[] };
      setResults(data.results?.slice(0, 12) ?? []);
    } catch { toast({ title: "Search failed", variant: "destructive" }); }
    finally { setIsSearching(false); }
  };

  const handleImport = async (item: TmdbResult) => {
    setImporting(prev => new Set(prev).add(item.id));
    const title = item.title ?? item.name ?? "";
    const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
    const genre = GENRE_MAP[item.genre_ids?.[0]] ?? "Drama";
    const rating = item.vote_average ? String(item.vote_average.toFixed(1)) : null;
    const poster_url = item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null;
    const backdrop_url = item.backdrop_path ? `${TMDB_BACKDROP}${item.backdrop_path}` : null;

    const payload = { title, year, genre, rating, description: item.overview, poster_url, backdrop_url, status: "draft", is_featured: false, is_trending: false, is_most_liked: false };

    const table = type === "movie" ? "movies" : "series";
    const extra = type === "tv" ? { seasons_count: 0 } : {};

    const { error } = await supabase.from(table).insert({ ...payload, ...extra });
    if (error) toast({ title: error.message, variant: "destructive" });
    else {
      toast({ title: `"${title}" imported as draft` });
      setImported(prev => new Set(prev).add(item.id));
      queryClient.invalidateQueries({ queryKey: ["admin", type === "movie" ? "movies" : "series"] });
    }
    setImporting(prev => { const next = new Set(prev); next.delete(item.id); return next; });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">TMDB Import</h1>
          <p className="text-sm text-muted-foreground mt-1">Search The Movie Database and import content as drafts</p>
        </div>

        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Search TMDB</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant={type === "movie" ? "default" : "outline"} size="sm" onClick={() => setType("movie")} className="rounded-xl gap-1.5"><Film className="h-3.5 w-3.5" /> Movies</Button>
              <Button variant={type === "tv" ? "default" : "outline"} size="sm" onClick={() => setType("tv")} className="rounded-xl gap-1.5"><Tv className="h-3.5 w-3.5" /> TV Series</Button>
            </div>
            <div className="flex gap-2">
              <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder={`Search ${type === "movie" ? "movies" : "TV series"}…`} className="rounded-xl" />
              <Button onClick={handleSearch} disabled={isSearching} className="rounded-xl shrink-0">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {results.map(item => {
              const isImporting = importing.has(item.id);
              const isImported = imported.has(item.id);
              return (
                <Card key={item.id} className="rounded-2xl border-card-border overflow-hidden group">
                  <div className="relative aspect-[2/3] bg-muted">
                    {item.poster_path ? (
                      <img src={`${TMDB_IMG}${item.poster_path}`} alt={item.title ?? item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm px-2 text-center">{item.title ?? item.name}</div>
                    )}
                    {isImported && <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"><Badge className="bg-emerald-500 text-white">Imported</Badge></div>}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold line-clamp-1 mb-1">{item.title ?? item.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-2">
                      {(item.release_date ?? item.first_air_date ?? "").slice(0, 4)} · {GENRE_MAP[item.genre_ids?.[0]] ?? "Drama"} · ⭐ {item.vote_average.toFixed(1)}
                    </p>
                    <Button size="sm" className="w-full h-7 text-xs rounded-lg" disabled={isImporting || isImported} onClick={() => handleImport(item)}>
                      {isImporting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                      {isImported ? "Imported" : isImporting ? "Importing…" : "Import"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
