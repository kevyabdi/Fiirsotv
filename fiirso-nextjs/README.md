# Fiirso — Next.js + Supabase

A Netflix-style streaming platform built with **Next.js 15** and **Supabase**. Deploy to Vercel with one `.env` file.

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Database + Auth**: Supabase (PostgreSQL + Supabase Auth)
- **UI**: shadcn/ui components, Framer Motion
- **Data**: React Query for client-side caching

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd fiirso-nextjs
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Copy your project credentials from **Settings → API**

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # optional
TMDB_API_KEY=your-tmdb-key                         # optional, for import
```

### 4. Create an admin account

1. Start the app: `npm run dev`
2. Go to `http://localhost:3000/auth` and create an account
3. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
4. Go to `http://localhost:3000/admin` and sign in

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the streaming app and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the environment variables from `.env.local`
4. Deploy — done ✓

## Features

### Streaming App (`/`)
- Hero slider with movies/banners
- Browse movies, TV series, by genre/category
- Search with genre filters
- Continue watching (local storage)
- My List (local storage)
- Profile + subscription page
- Dark/light mode

### Admin Panel (`/admin`)
- Dashboard with stats
- Movies CRUD with TMDB import
- TV Series CRUD with TMDB import
- Seasons & episodes management
- Categories management
- Banners management
- Users management (ban, promote to admin)
- Analytics chart
- Settings

## Database Schema

All tables are in `supabase/schema.sql`:

| Table | Description |
|-------|-------------|
| `profiles` | User accounts (extends Supabase auth) |
| `movies` | Movie entries |
| `series` | TV series entries |
| `seasons` | Seasons per series |
| `episodes` | Episodes per season |
| `categories` | Content categories |
| `banners` | Hero slider banners |
| `settings` | Site-wide settings |

## Project Structure

```
fiirso-nextjs/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Streaming home page
│   ├── movies/             # Movies browse
│   ├── tv-series/          # Series browse
│   ├── movie/[id]/         # Detail + player page
│   ├── search/             # Search
│   ├── auth/               # Login/register
│   ├── profile/            # User profile
│   ├── admin/              # Admin panel (all pages)
│   └── api/admin/tmdb/     # TMDB proxy route
├── components/
│   ├── admin/              # Admin UI (Layout, Sidebar, Forms)
│   ├── layout/             # Viewer layout, Navbar
│   └── ui/                 # shadcn/ui components + media cards
├── contexts/               # React contexts (Auth, Content, etc.)
├── lib/
│   ├── supabase/           # Supabase client helpers
│   ├── types.ts            # TypeScript types + transform functions
│   └── utils.ts            # Utility functions
├── hooks/                  # Custom hooks (use-toast)
├── supabase/
│   └── schema.sql          # Full database schema
├── middleware.ts            # Admin route protection
└── .env.example            # Environment variable template
```
