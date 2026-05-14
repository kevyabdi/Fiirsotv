"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { MediaCard } from "@/components/ui/media-card";
import { useContentLibrary } from "@/contexts/ContentLibraryContext";
import { ViewerLayout } from "@/components/layout/ViewerLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function TVSeriesPage() {
  const [search, setSearch] = useState("");
  const { tvSeries, isLoading } = useContentLibrary();

  const filtered = tvSeries.filter(m =>
    !search ||
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ViewerLayout>
      <div className="px-5 lg:px-12 pt-8 pb-28 lg:pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">TV Series</h1>
          <span className="text-sm text-foreground/40">{tvSeries.length} titles</span>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search series..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-foreground/[0.06] border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-foreground/30"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {Array.from({ length: 14 }).map((_, i) => <div key={i}><Skeleton className="aspect-[2/3] rounded-2xl" /></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-foreground/30">
            <p className="text-lg font-semibold">{search ? "No results found" : "No series yet"}</p>
            <p className="text-sm mt-1">{search ? "Try a different search term" : "Check back later"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {filtered.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.6) }}>
                <MediaCard item={item} showQuality />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ViewerLayout>
  );
}
