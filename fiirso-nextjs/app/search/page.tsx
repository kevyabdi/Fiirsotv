"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MediaCard } from "@/components/ui/media-card";
import { useContentLibrary } from "@/contexts/ContentLibraryContext";
import { ViewerLayout } from "@/components/layout/ViewerLayout";

const GENRES = ["Action", "Drama", "Comedy", "Thriller", "Horror", "Sci-Fi", "Romance", "Fantasy", "Animation"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const { allContent, isLoading } = useContentLibrary();

  const results = useMemo(() => {
    let items = allContent;
    if (activeGenre) items = items.filter(m => m.genre === activeGenre || (m.tags ?? []).some(t => t.toLowerCase() === activeGenre.toLowerCase()));
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(m => m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q) || (m.tags ?? []).some(t => t.toLowerCase().includes(q)));
    }
    return items;
  }, [query, activeGenre, allContent]);

  return (
    <ViewerLayout>
      <div className="px-5 lg:px-12 pt-8 pb-28 lg:pb-10">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Search</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search titles, genres…"
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-foreground/[0.06] border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-foreground/30"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setActiveGenre(g => g === genre ? null : genre)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeGenre === genre ? "bg-foreground text-background" : "bg-foreground/[0.07] text-foreground/60 hover:bg-foreground/[0.12]"}`}
            >
              {genre}
            </button>
          ))}
        </div>

        {!query && !activeGenre ? (
          <div className="flex flex-col items-center justify-center py-24 text-foreground/30">
            <Search className="w-12 h-12 mb-4" strokeWidth={1.5} />
            <p className="text-base font-semibold">Search for something</p>
            <p className="text-sm mt-1">Movies, TV series, genres…</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-foreground/30">
            <p className="text-lg font-semibold">No results</p>
            <p className="text-sm mt-1">Try different keywords or genres</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              {results.map((item, i) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}>
                  <MediaCard item={item} showQuality />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </ViewerLayout>
  );
}
