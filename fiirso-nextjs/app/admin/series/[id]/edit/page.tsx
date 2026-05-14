"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SeriesForm } from "@/components/admin/SeriesForm";
import type { Series } from "@/lib/types";

const seriesSchema = z.object({
  title: z.string().min(1), year: z.string().min(4), genre: z.string().min(1),
  rating: z.string().optional(), description: z.string().optional(), long_description: z.string().optional(),
  poster_url: z.string().url().optional().or(z.literal("")), backdrop_url: z.string().url().optional().or(z.literal("")),
  trailer_url: z.string().url().optional().or(z.literal("")), quality: z.string().optional(),
  director: z.string().optional(), tags: z.string().optional(),
  seasons_count: z.coerce.number().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  is_featured: z.boolean().default(false), is_trending: z.boolean().default(false), is_most_liked: z.boolean().default(false),
});
type SeriesFormValues = z.infer<typeof seriesSchema>;

export default function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seriesId = parseInt(id);
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: series, isLoading } = useQuery<Series>({
    queryKey: ["admin", "series", seriesId],
    queryFn: async () => { const { data, error } = await supabase.from("series").select("*").eq("id", seriesId).single(); if (error) throw error; return data; },
  });

  const form = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: { title: "", year: new Date().getFullYear().toString(), genre: "", rating: "", description: "", long_description: "", poster_url: "", backdrop_url: "", trailer_url: "", quality: "HD", director: "", tags: "", seasons_count: 0, status: "draft", is_featured: false, is_trending: false, is_most_liked: false },
  });

  useEffect(() => {
    if (series) {
      form.reset({
        title: series.title, year: series.year, genre: series.genre, rating: series.rating ?? "", description: series.description ?? "", long_description: series.long_description ?? "",
        poster_url: series.poster_url ?? "", backdrop_url: series.backdrop_url ?? "", trailer_url: series.trailer_url ?? "", quality: series.quality ?? "HD", director: series.director ?? "",
        tags: (series.tags ?? []).join(", "), seasons_count: series.seasons_count,
        status: series.status as "draft" | "published", is_featured: series.is_featured, is_trending: series.is_trending, is_most_liked: series.is_most_liked,
      });
    }
  }, [series, form]);

  const mutation = useMutation({
    mutationFn: async (data: SeriesFormValues) => {
      const payload = { ...data, tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [], updated_at: new Date().toISOString() };
      const { error } = await supabase.from("series").update(payload).eq("id", seriesId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "series"] }); router.push("/admin/series"); },
  });

  if (isLoading) return <AdminLayout><div className="h-64 bg-muted rounded-2xl animate-pulse max-w-3xl mx-auto" /></AdminLayout>;

  return (
    <AdminLayout>
      <SeriesForm form={form} onSubmit={data => mutation.mutate(data)} isPending={mutation.isPending} isEditing error={mutation.error?.message} />
    </AdminLayout>
  );
}
