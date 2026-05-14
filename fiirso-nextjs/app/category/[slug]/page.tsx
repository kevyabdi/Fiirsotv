"use client";

import { useMemo, use } from "react";
import { motion } from "framer-motion";
import { MediaCard } from "@/components/ui/media-card";
import { useContentLibrary } from "@/contexts/ContentLibraryContext";
import { ViewerLayout } from "@/components/layout/ViewerLayout";

const CATEGORY_MAP: Record<string, { title: string; filter: (item: { genre: string; isFeatured?: boolean; isTrending?: boolean; isMostLiked?: boolean; type: string; tags?: string[]; rating: string }) => boolean }> = {
  "featured": { title: "Featured Tonight", filter: m => !!m.isFeatured },
  "featured-tonight": { title: "Featured Tonight", filter: m => !!m.isFeatured },
  "top-rated": { title: "Top Rated", filter: () => true },
  "trending": { title: "Trending Now", filter: m => !!m.isTrending },
  "most-liked": { title: "Most Liked", filter: m => !!m.isMostLiked },
  "new-series": { title: "New Series", filter: m => m.type === "tv" },
  "action": { title: "Action & Thriller", filter: m => m.genre === "Action" || m.genre === "Thriller" || (m.tags ?? []).some(t => t.toLowerCase().includes("action")) },
  "action-thriller": { title: "Action & Thriller", filter: m => m.genre === "Action" || m.genre === "Thriller" },
  "drama": { title: "Drama", filter: m => m.genre === "Drama" },
  "comedy": { title: "Comedy", filter: m => m.genre === "Comedy" },
  "horror": { title: "Horror", filter: m => m.genre === "Horror" },
  "sci-fi": { title: "Sci-Fi", filter: m => m.genre === "Sci-Fi" },
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { allContent } = useContentLibrary();
  const category = CATEGORY_MAP[slug];

  const items = useMemo(() => {
    if (!category) return allContent.filter(m => m.genre.toLowerCase() === slug.replace(/-/g, " ").toLowerCase());
    const filtered = allContent.filter(category.filter);
    if (slug === "top-rated") return [...filtered].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    return filtered;
  }, [allContent, category, slug]);

  const title = category?.title ?? slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <ViewerLayout>
      <div className="px-5 lg:px-12 pt-8 pb-28 lg:pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <span className="text-sm text-foreground/40">{items.length} titles</span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-foreground/30">
            <p className="text-lg font-semibold">Nothing here yet</p>
            <p className="text-sm mt-1">Check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {items.map((item, i) => (
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
