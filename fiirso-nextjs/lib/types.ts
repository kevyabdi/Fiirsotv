export interface Movie {
  id: number;
  title: string;
  year: string;
  genre: string;
  rating: string | null;
  duration: string | null;
  description: string;
  long_description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  embed_url: string | null;
  quality: string;
  director: string | null;
  tags: string[] | null;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  is_most_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Series {
  id: number;
  title: string;
  year: string;
  genre: string;
  rating: string | null;
  description: string;
  long_description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  quality: string;
  director: string | null;
  tags: string[] | null;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  is_most_liked: boolean;
  seasons_count: number;
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: number;
  series_id: number;
  season_number: number;
  title: string | null;
  description: string | null;
  poster_url: string | null;
  created_at: string;
}

export interface Episode {
  id: number;
  season_id: number;
  episode_number: number;
  title: string;
  description: string | null;
  duration: string | null;
  embed_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_label: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

export interface AppSettings {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  numericId: number;
  title: string;
  year: string;
  genre: string;
  rating: string;
  duration?: string;
  seasons?: number;
  description: string;
  longDescription?: string;
  posterUrl: string;
  backdropUrl: string;
  type: "movie" | "tv";
  quality: "4K" | "HD" | "CAM";
  director?: string;
  tags?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isMostLiked?: boolean;
  isNew?: boolean;
  createdAt?: string;
  embedUrl?: string;
  trailerUrl?: string;
}

const FALLBACK_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' font-size='40' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%8E%AC%3C%2Ftext%3E%3C/svg%3E";
const FALLBACK_BACKDROP =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' font-size='60' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%8E%AC%3C%2Ftext%3E%3C/svg%3E";

function safeQuality(q: string | null | undefined): MediaItem["quality"] {
  if (q === "4K" || q === "HD" || q === "CAM") return q;
  return "HD";
}

export function movieToMediaItem(m: Movie): MediaItem {
  return {
    id: `movie-${m.id}`,
    numericId: m.id,
    title: m.title,
    year: m.year,
    genre: m.genre,
    rating: m.rating ?? "7.0",
    duration: m.duration ?? undefined,
    description: m.description,
    longDescription: m.long_description ?? undefined,
    posterUrl: m.poster_url ?? FALLBACK_POSTER,
    backdropUrl: m.backdrop_url ?? FALLBACK_BACKDROP,
    type: "movie",
    quality: safeQuality(m.quality),
    director: m.director ?? undefined,
    tags: m.tags ?? [],
    isFeatured: m.is_featured,
    isTrending: m.is_trending,
    isMostLiked: m.is_most_liked,
    createdAt: m.created_at,
    embedUrl: m.embed_url ?? undefined,
    trailerUrl: m.trailer_url ?? undefined,
  };
}

export function seriesToMediaItem(s: Series): MediaItem {
  return {
    id: `series-${s.id}`,
    numericId: s.id,
    title: s.title,
    year: s.year,
    genre: s.genre,
    rating: s.rating ?? "7.0",
    seasons: s.seasons_count || 1,
    description: s.description,
    longDescription: s.long_description ?? undefined,
    posterUrl: s.poster_url ?? FALLBACK_POSTER,
    backdropUrl: s.backdrop_url ?? FALLBACK_BACKDROP,
    type: "tv",
    quality: safeQuality(s.quality),
    director: s.director ?? undefined,
    tags: s.tags ?? [],
    isFeatured: s.is_featured,
    isTrending: s.is_trending,
    isMostLiked: s.is_most_liked,
    createdAt: s.created_at,
    trailerUrl: s.trailer_url ?? undefined,
  };
}
