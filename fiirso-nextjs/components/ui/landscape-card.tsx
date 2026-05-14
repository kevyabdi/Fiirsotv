"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import type { MediaItem } from "@/lib/types";

interface LandscapeCardProps {
  item: MediaItem;
  progress?: number;
}

export function LandscapeCard({ item, progress = 0 }: LandscapeCardProps) {
  const router = useRouter();

  return (
    <motion.div
      className="shrink-0 w-[240px] md:w-[280px] cursor-pointer group"
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => router.push(`/movie/${item.id}`)}
    >
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-foreground/[0.06] shadow-md group-hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)] transition-shadow duration-400">
        <img
          src={item.backdropUrl || item.posterUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-xs font-semibold text-foreground/90 line-clamp-1 group-hover:text-foreground transition-colors">{item.title}</p>
        <p className="text-[10px] text-foreground/40 mt-0.5">{item.type === "tv" ? "Series" : "Movie"} · {item.year}</p>
      </div>
    </motion.div>
  );
}
