"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MovieForm } from "@/components/admin/MovieForm";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.string().min(4, "Year is required"),
  genre: z.string().min(1, "Genre is required"),
  rating: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  poster_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  backdrop_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  trailer_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  embed_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  quality: z.string().optional(),
  director: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  is_featured: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  is_most_liked: z.boolean().default(false),
});

export type MovieFormValues = z.infer<typeof movieSchema>;

export default function NewMoviePage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

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

  const mutation = useMutation({
    mutationFn: async (data: MovieFormValues) => {
      const payload = { ...data, tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [] };
      const { error } = await supabase.from("movies").insert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "movies"] });
      router.push("/admin/movies");
    },
  });

  return (
    <AdminLayout>
      <MovieForm form={form} onSubmit={data => mutation.mutate(data)} isPending={mutation.isPending} isEditing={false} error={mutation.error?.message} />
    </AdminLayout>
  );
}
