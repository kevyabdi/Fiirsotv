"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  movieToMediaItem,
  seriesToMediaItem,
  type MediaItem,
  type Movie,
  type Series,
} from "@/lib/types";

interface ContentLibraryContextValue {
  movies: MediaItem[];
  tvSeries: MediaItem[];
  allContent: MediaItem[];
  featuredContent: MediaItem[];
  trendingContent: MediaItem[];
  mostLikedContent: MediaItem[];
  isLoading: boolean;
}

const ContentLibraryContext = createContext<ContentLibraryContextValue>({
  movies: [], tvSeries: [], allContent: [],
  featuredContent: [], trendingContent: [], mostLikedContent: [],
  isLoading: false,
});

export function ContentLibraryProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const { data: moviesRaw = [], isLoading: loadingMovies } = useQuery<Movie[]>({
    queryKey: ["movies", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: seriesRaw = [], isLoading: loadingSeries } = useQuery<Series[]>({
    queryKey: ["series", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data ?? [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const movies = useMemo(() => moviesRaw.map(movieToMediaItem), [moviesRaw]);
  const tvSeries = useMemo(() => seriesRaw.map(seriesToMediaItem), [seriesRaw]);
  const allContent = useMemo(() => [...movies, ...tvSeries], [movies, tvSeries]);

  const featuredContent = useMemo(
    () => allContent.filter(i => i.isFeatured),
    [allContent],
  );
  const trendingContent = useMemo(
    () => allContent.filter(i => i.isTrending),
    [allContent],
  );
  const mostLikedContent = useMemo(
    () => allContent.filter(i => i.isMostLiked),
    [allContent],
  );

  const value = useMemo(
    () => ({
      movies, tvSeries, allContent, featuredContent,
      trendingContent, mostLikedContent,
      isLoading: loadingMovies || loadingSeries,
    }),
    [movies, tvSeries, allContent, featuredContent, trendingContent, mostLikedContent, loadingMovies, loadingSeries],
  );

  return (
    <ContentLibraryContext.Provider value={value}>
      {children}
    </ContentLibraryContext.Provider>
  );
}

export function useContentLibrary() { return useContext(ContentLibraryContext); }
