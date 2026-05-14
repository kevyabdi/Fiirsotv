-- ═══════════════════════════════════════════════════════
-- FIIRSO — Supabase Schema
-- Run this SQL in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════

-- ── Enable UUID extension ────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────
-- Extends auth.users; created automatically on signup via trigger
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'viewer',
  plan        TEXT NOT NULL DEFAULT 'free',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── Categories ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Movies ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.movies (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  year             TEXT NOT NULL,
  genre            TEXT NOT NULL DEFAULT 'Drama',
  rating           TEXT,
  duration         TEXT,
  description      TEXT NOT NULL DEFAULT '',
  long_description TEXT,
  poster_url       TEXT,
  backdrop_url     TEXT,
  trailer_url      TEXT,
  embed_url        TEXT,
  quality          TEXT NOT NULL DEFAULT 'HD',
  director         TEXT,
  tags             TEXT[],
  status           TEXT NOT NULL DEFAULT 'draft',
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_trending      BOOLEAN NOT NULL DEFAULT false,
  is_most_liked    BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Series ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.series (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  year             TEXT NOT NULL,
  genre            TEXT NOT NULL DEFAULT 'Drama',
  rating           TEXT,
  description      TEXT NOT NULL DEFAULT '',
  long_description TEXT,
  poster_url       TEXT,
  backdrop_url     TEXT,
  trailer_url      TEXT,
  quality          TEXT NOT NULL DEFAULT 'HD',
  director         TEXT,
  tags             TEXT[],
  status           TEXT NOT NULL DEFAULT 'draft',
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_trending      BOOLEAN NOT NULL DEFAULT false,
  is_most_liked    BOOLEAN NOT NULL DEFAULT false,
  seasons_count    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seasons ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seasons (
  id             SERIAL PRIMARY KEY,
  series_id      INTEGER NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  season_number  INTEGER NOT NULL,
  title          TEXT,
  description    TEXT,
  poster_url     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (series_id, season_number)
);

-- ── Episodes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.episodes (
  id              SERIAL PRIMARY KEY,
  season_id       INTEGER NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  episode_number  INTEGER NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  duration        TEXT,
  embed_url       TEXT,
  thumbnail_url   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (season_id, episode_number)
);

-- ── Banners ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  subtitle     TEXT,
  image_url    TEXT NOT NULL,
  link_url     TEXT,
  button_label TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Settings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  key        TEXT PRIMARY KEY,
  value      JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('site', '{"site_name":"Fiirso","site_description":"Stream movies and TV series","contact_email":"","tmdb_api_key_configured":false}')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings   ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles: users see their own, admins see all
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL USING (public.is_admin());

-- movies: anyone can read published; admins can do everything
CREATE POLICY "Anyone can read published movies"
  ON public.movies FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins can manage movies"
  ON public.movies FOR ALL USING (public.is_admin());

-- series: same as movies
CREATE POLICY "Anyone can read published series"
  ON public.series FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins can manage series"
  ON public.series FOR ALL USING (public.is_admin());

-- seasons: anyone can read
CREATE POLICY "Anyone can read seasons"
  ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Admins can manage seasons"
  ON public.seasons FOR ALL USING (public.is_admin());

-- episodes: anyone can read
CREATE POLICY "Anyone can read episodes"
  ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Admins can manage episodes"
  ON public.episodes FOR ALL USING (public.is_admin());

-- categories: anyone can read
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL USING (public.is_admin());

-- banners: anyone can read active
CREATE POLICY "Anyone can read active banners"
  ON public.banners FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage banners"
  ON public.banners FOR ALL USING (public.is_admin());

-- settings: anyone can read, only admins can write
CREATE POLICY "Anyone can read settings"
  ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL USING (public.is_admin());

-- ═══════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_movies_status ON public.movies(status);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON public.movies(genre);
CREATE INDEX IF NOT EXISTS idx_movies_featured ON public.movies(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_movies_trending ON public.movies(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_series_status ON public.series(status);
CREATE INDEX IF NOT EXISTS idx_series_genre ON public.series(genre);
CREATE INDEX IF NOT EXISTS idx_seasons_series_id ON public.seasons(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_id ON public.episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active) WHERE is_active = true;

-- ═══════════════════════════════════════════════════════
-- CREATE ADMIN USER (run separately after signup)
-- ═══════════════════════════════════════════════════════
-- After creating your admin account via the app or Supabase Auth,
-- run this to promote it to admin:
--
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
