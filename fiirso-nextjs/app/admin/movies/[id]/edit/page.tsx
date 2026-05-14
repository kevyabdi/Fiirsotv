"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MovieForm } from "@/components/admin/MovieForm";
import type { Movie } from "@/lib/types";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.string().min(4),
  genre: z.string().min(1),
  rating: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  poster_url: z.string().url().optional().or(z.literal("")),
  backdrop_url: z.string().url().optional().or(z.literal("")),
  trailer_url: z.string().url().optional().or(z.literal("")),
  embed_url: z.string().url().optional().or(z.literal("")),
  quality: z.string().optional(),
  director: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  is_featured: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  is_most_liked: z.boolean().default(false),
});

export type MovieFormValues = z.infer<typeof movieSchema>;

export default function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const movieId = parseInt(id);
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: movie, isLoading } = useQuery<Movie>({
    queryKey: ["admin", "movie", movieId],
    queryFn: async () => {
      const { data, error } = await supabase.from("movies").select("*").eq("id", movieId).single();
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "", year: new Date().getFullYear().toString(), genre: "",
      rating: "", duration: "", description: "", long_description: "",
      poster_url: "", backdrop_url: "", trailer_url: "", embed_url: "",
      quality: "HD", director: "", tags: "", status: "draft",
      is_featured: false, is_trending: false, is_most_liked: false,
    },
  });

  useEffect(() => {
    if (movie) {
      form.reset({
        title: movie.title, year: movie.year, genre: movie.genre,
        rating: movie.rating ?? "", duration: movie.duration ?? "",
        description: movie.description ?? "", long_description: movie.long_description ?? "",
        poster_url: movie.poster_url ?? "", backdrop_url: movie.backdrop_url ?? "",
        trailer_url: movie.trailer_url ?? "", embed_url: movie.embed_url ?? "",
        quality: movie.quality ?? "HD", director: movie.director ?? "",
        tags: (movie.tags ?? []).join(", "),
        status: movie.status as "draft" | "published",
        is_featured: movie.is_featured, is_trending: movie.is_trending, is_most_liked: movie.is_most_liked,
      });
    }
  }, [movie, form]);

  const mutation = useMutation({
    mutationFn: async (data: MovieFormValues) => {
      const payload = { ...data, tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [], updated_at: new Date().toISOString() };
      const { error } = await supabase.from("movies").update(payload).eq("id", movieId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "movies"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "movie", movieId] });
      router.push("/admin/movies");
    },
  });

  if (isLoading) {
    return <AdminLayout><div className="space-y-4 max-w-3xl mx-auto"><div className="h-9 w-48 bg-muted rounded-xl animate-pulse" /><div className="h-64 bg-muted rounded-2xl animate-pulse" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <MovieForm form={form} onSubmit={data => mutation.mutate(data)} isPending={mutation.isPending} isEditing error={mutation.error?.message} />
    </AdminLayout>
  );
}
