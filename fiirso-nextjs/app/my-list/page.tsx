"use client";

import { motion } from "framer-motion";
import { Bookmark, Trash2 } from "lucide-react";
import { MediaCard } from "@/components/ui/media-card";
import { useMyList } from "@/contexts/MyListContext";
import { ViewerLayout } from "@/components/layout/ViewerLayout";

export default function MyListPage() {
  const { list, toggleList, clearList } = useMyList();

  return (
    <ViewerLayout>
      <div className="px-5 lg:px-12 pt-8 pb-28 lg:pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">My List</h1>
          {list.length > 0 && (
            <button onClick={clearList} className="flex items-center gap-1.5 text-sm text-foreground/40 hover:text-destructive transition-colors">
              <Trash2 className="h-4 w-4" /> Clear all
            </button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-foreground/30">
            <Bookmark className="w-12 h-12 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-semibold">Your list is empty</p>
            <p className="text-sm mt-1">Save movies and series to watch later</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
            {list.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.5) }}>
                <MediaCard item={item} showQuality />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ViewerLayout>
  );
}
