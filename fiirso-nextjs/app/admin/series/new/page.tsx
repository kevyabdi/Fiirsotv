"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SeriesForm } from "@/components/admin/SeriesForm";

export const seriesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.string().min(4),
  genre: z.string().min(1),
  rating: z.string().optional(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  poster_url: z.string().url().optional().or(z.literal("")),
  backdrop_url: z.string().url().optional().or(z.literal("")),
  trailer_url: z.string().url().optional().or(z.literal("")),
  quality: z.string().optional(),
  director: z.string().optional(),
  tags: z.string().optional(),
  seasons_count: z.coerce.number().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  is_featured: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  is_most_liked: z.boolean().default(false),
});

export type SeriesFormValues = z.infer<typeof seriesSchema>;

export default function NewSeriesPage() {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const form = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: "", year: new Date().getFullYear().toString(), genre: "",
      rating: "", description: "", long_description: "",
      poster_url: "", backdrop_url: "", trailer_url: "",
      quality: "HD", director: "", tags: "", seasons_count: 0,
      status: "draft", is_featured: false, is_trending: false, is_most_liked: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SeriesFormValues) => {
      const payload = { ...data, tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [] };
      const { error } = await supabase.from("series").insert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "series"] }); router.push("/admin/series"); },
  });

  return (
    <AdminLayout>
      <SeriesForm form={form} onSubmit={data => mutation.mutate(data)} isPending={mutation.isPending} isEditing={false} error={mutation.error?.message} />
    </AdminLayout>
  );
}
