"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const supabase = createClient();

  const { data: movies = [] } = useQuery({
    queryKey: ["admin", "analytics", "movies"],
    queryFn: async () => { const { data } = await supabase.from("movies").select("genre, status").order("genre"); return data ?? []; },
  });
  const { data: series = [] } = useQuery({
    queryKey: ["admin", "analytics", "series"],
    queryFn: async () => { const { data } = await supabase.from("series").select("genre, status").order("genre"); return data ?? []; },
  });

  const genreData = [...movies, ...series].reduce<Record<string, number>>((acc, item) => {
    const g = (item as { genre: string }).genre || "Other";
    acc[g] = (acc[g] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(genreData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre, count]) => ({ genre, count }));

  const totalPublished = [...movies, ...series].filter(i => (i as { status: string }).status === "published").length;
  const totalDraft = [...movies, ...series].filter(i => (i as { status: string }).status === "draft").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Movies", value: movies.length },
            { label: "Total Series", value: series.length },
            { label: "Published", value: totalPublished },
            { label: "Draft", value: totalDraft },
          ].map(stat => (
            <Card key={stat.label} className="rounded-2xl border-card-border">
              <CardContent className="p-5">
                {movies.length === 0 && series.length === 0 ? <Skeleton className="h-8 w-16 mb-1" /> : <p className="text-2xl font-bold">{stat.value}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {chartData.length > 0 && (
          <Card className="rounded-2xl border-card-border">
            <CardHeader><CardTitle className="text-sm font-semibold">Content by Genre</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="genre" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
