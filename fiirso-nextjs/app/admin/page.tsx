"use client";

import { useQuery } from "@tanstack/react-query";
import { Film, Tv, Tags, BarChart3, Users, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Stats {
  movies: number;
  series: number;
  categories: number;
  users: number;
  banners: number;
  publishedMovies: number;
  publishedSeries: number;
}

export default function AdminDashboard() {
  const supabase = createClient();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [movies, series, categories, users, banners, publishedMovies, publishedSeries] = await Promise.all([
        supabase.from("movies").select("*", { count: "exact", head: true }),
        supabase.from("series").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("banners").select("*", { count: "exact", head: true }),
        supabase.from("movies").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("series").select("*", { count: "exact", head: true }).eq("status", "published"),
      ]);
      return {
        movies: movies.count ?? 0,
        series: series.count ?? 0,
        categories: categories.count ?? 0,
        users: users.count ?? 0,
        banners: banners.count ?? 0,
        publishedMovies: publishedMovies.count ?? 0,
        publishedSeries: publishedSeries.count ?? 0,
      };
    },
  });

  const statCards = [
    { label: "Total Movies", value: stats?.movies ?? 0, sub: `${stats?.publishedMovies ?? 0} published`, icon: Film, href: "/admin/movies", color: "text-blue-500" },
    { label: "Total Series", value: stats?.series ?? 0, sub: `${stats?.publishedSeries ?? 0} published`, icon: Tv, href: "/admin/series", color: "text-purple-500" },
    { label: "Categories", value: stats?.categories ?? 0, sub: "content categories", icon: Tags, href: "/admin/categories", color: "text-green-500" },
    { label: "Users", value: stats?.users ?? 0, sub: "registered accounts", icon: Users, href: "/admin/users", color: "text-orange-500" },
    { label: "Banners", value: stats?.banners ?? 0, sub: "hero banners", icon: ImageIcon, href: "/admin/banners", color: "text-pink-500" },
    { label: "Total Content", value: (stats?.movies ?? 0) + (stats?.series ?? 0), sub: "movies + series", icon: BarChart3, href: "/admin/analytics", color: "text-cyan-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your streaming platform</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(card => (
            <Link key={card.label} href={card.href}>
              <Card className="rounded-2xl border-card-border hover:border-border transition-colors cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl bg-foreground/[0.06] group-hover:bg-foreground/[0.1] transition-colors`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-16 bg-foreground/[0.08] rounded animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-bold tracking-tight">{card.value.toLocaleString()}</p>
                  )}
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{card.label}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{card.sub}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Add Movie", href: "/admin/movies/new" },
              { label: "Add Series", href: "/admin/series/new" },
              { label: "Add Banner", href: "/admin/banners" },
              { label: "TMDB Import", href: "/admin/import" },
              { label: "Manage Users", href: "/admin/users" },
            ].map(action => (
              <Link key={action.label} href={action.href} className="px-4 py-2 rounded-xl text-sm font-medium bg-foreground/[0.06] hover:bg-foreground/[0.1] transition-colors border border-border">
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
