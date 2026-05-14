"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Check, Star, Clock, Calendar, Tv, ChevronDown, Home, Link2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContentLibrary } from "@/contexts/ContentLibraryContext";
import { VideoPlayer } from "@/components/ui/video-player";
import { MediaCard } from "@/components/ui/media-card";
import { useWatchHistory } from "@/contexts/WatchHistoryContext";
import { useMyList } from "@/contexts/MyListContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Season, Episode } from "@/lib/types";
import { ViewerLayout } from "@/components/layout/ViewerLayout";

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [copied, setCopied] = useState(false);
  const { addToHistory } = useWatchHistory();
  const { isInList, toggleList } = useMyList();
  const { toast } = useToast();
  const { allContent, movies, tvSeries } = useContentLibrary();
  const supabase = createClient();

  const item = allContent.find(m => m.id === id);
  const isSeries = item?.type === "tv";
  const numericId = item?.numericId ?? 0;

  const { data: seasons = [] } = useQuery<Season[]>({
    queryKey: ["seasons", numericId],
    queryFn: async () => {
      const { data } = await supabase.from("seasons").select("*").eq("series_id", numericId).order("season_number");
      return data ?? [];
    },
    enabled: isSeries && numericId > 0,
    staleTime: 30_000,
  });

  const selectedSeasonObj = seasons.find(s => s.season_number === selectedSeason);
  const selectedSeasonId = selectedSeasonObj?.id ?? 0;

  const { data: episodes = [] } = useQuery<Episode[]>({
    queryKey: ["episodes", selectedSeasonId],
    queryFn: async () => {
      const { data } = await supabase.from("episodes").select("*").eq("season_id", selectedSeasonId).order("episode_number");
      return data ?? [];
    },
    enabled: isSeries && selectedSeasonId > 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (item) addToHistory(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: item?.title, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied!" });
    } catch { toast({ title: "Link copied!", description: "Share link copied to clipboard." }); }
  };

  if (!item) {
    return (
      <ViewerLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <p className="text-foreground/40 text-lg">Content not found</p>
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors">
            <Home className="h-4 w-4" /> Go home
          </button>
        </div>
      </ViewerLayout>
    );
  }

  const inList = isInList(item.id);
  const related = [...movies, ...tvSeries].filter(m => m.id !== item.id && m.genre === item.genre).slice(0, 8);

  return (
    <ViewerLayout>
      <div className="min-h-screen pb-20 lg:pb-10">
        {/* Video Player */}
        <AnimatePresence>
          {showPlayer && (
            <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
              <div className="w-full max-w-4xl">
                <VideoPlayer item={item} onClose={() => setShowPlayer(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop */}
        <div className="relative w-full" style={{ height: "55vh", minHeight: 320 }}>
          <img src={item.backdropUrl} alt={item.title} className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

          <button onClick={() => router.back()} className="absolute top-4 left-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-black/70 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 lg:px-12 -mt-24 relative z-10 max-w-4xl">
          <div className="flex gap-4 mb-4">
            <div className="hidden sm:block w-32 shrink-0 rounded-xl overflow-hidden aspect-[2/3] bg-card border border-border">
              <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-end">
              <div className="flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase text-foreground/40 mb-2">
                <span>{item.type === "movie" ? "Movie" : "Series"}</span>
                <span className="w-0.5 h-0.5 rounded-full bg-foreground/25" />
                <span>{item.year}</span>
                <span className="w-0.5 h-0.5 rounded-full bg-foreground/25" />
                <span>{item.genre}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-3">{item.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60 mb-4">
                {item.rating && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{item.rating}</span>}
                {item.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.duration}</span>}
                {item.seasons && <span className="flex items-center gap-1"><Tv className="h-3.5 w-3.5" />{item.seasons} Season{item.seasons !== 1 ? "s" : ""}</span>}
                {item.quality && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-foreground/[0.08]">{item.quality}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPlayer(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-md">
                  <Play className="h-4 w-4 fill-current" /> Play
                </button>
                <button onClick={() => toggleList(item)} className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/[0.08] hover:bg-foreground/[0.14] transition-colors border border-border">
                  {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
                <button onClick={handleShare} className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground/[0.08] hover:bg-foreground/[0.14] transition-colors border border-border" title="Share">
                  <Link2 className={cn("h-4 w-4", copied && "text-emerald-500")} />
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-foreground/60 leading-relaxed mb-6">{item.longDescription ?? item.description}</p>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs bg-foreground/[0.07] text-foreground/60 border border-border">{tag}</span>
              ))}
            </div>
          )}

          {/* Series seasons/episodes */}
          {isSeries && seasons.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Episodes</h2>
                <div className="relative">
                  <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))} className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-foreground/[0.07] border border-border text-sm font-medium focus:outline-none cursor-pointer">
                    {seasons.map(s => <option key={s.id} value={s.season_number}>Season {s.season_number}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/50 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                {episodes.map(ep => (
                  <div key={ep.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-card-border hover:border-border transition-colors group">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-foreground/[0.06] flex items-center justify-center text-sm font-bold text-foreground/40 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      {ep.episode_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ep.title}</p>
                      {ep.duration && <p className="text-xs text-foreground/40">{ep.duration}</p>}
                    </div>
                    <button onClick={() => setShowPlayer(true)} className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-foreground/[0.08] hover:bg-primary hover:text-primary-foreground transition-all">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </div>
                ))}
                {episodes.length === 0 && <p className="text-sm text-foreground/40 py-4 text-center">No episodes available yet.</p>}
              </div>
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">More Like This</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {related.map(m => <MediaCard key={m.id} item={m} showQuality />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </ViewerLayout>
  );
}
