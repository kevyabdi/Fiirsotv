"use client";

import { type UseFormReturn } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TmdbSearch } from "@/components/admin/TmdbSearch";
import { useToast } from "@/hooks/use-toast";

export interface MovieFormValues {
  title: string;
  year: string;
  genre: string;
  rating?: string;
  duration?: string;
  description?: string;
  long_description?: string;
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  embed_url?: string;
  quality?: string;
  director?: string;
  tags?: string;
  status: "draft" | "published";
  is_featured: boolean;
  is_trending: boolean;
  is_most_liked: boolean;
}

interface MovieFormProps {
  form: UseFormReturn<MovieFormValues>;
  onSubmit: (data: MovieFormValues) => void;
  isPending: boolean;
  isEditing: boolean;
  error?: string;
}

export function MovieForm({ form, onSubmit, isPending, isEditing, error }: MovieFormProps) {
  const { toast } = useToast();
  const posterUrl = form.watch("poster_url");

  const handleTmdbSelect = (data: Partial<MovieFormValues>) => {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.setValue(key as keyof MovieFormValues, value as never, { shouldDirty: true });
      }
    });
    toast({ title: "Fields populated from TMDB" });
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <Link href="/admin/movies">
          <Button variant="outline" size="icon" className="rounded-xl h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{isEditing ? "Edit Movie" : "Add Movie"}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{isEditing ? "Update movie details" : "Create a new movie entry"}</p>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}
      {!isEditing && <TmdbSearch type="movie" onSelect={handleTmdbSelect} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic Info */}
          <Card className="rounded-2xl border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {posterUrl && (
                  <div className="sm:col-span-1 flex justify-center">
                    <div className="h-36 w-24 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                      <img src={posterUrl} alt="Poster" className="h-full w-full object-cover" />
                    </div>
                  </div>
                )}
                <div className={`space-y-4 ${posterUrl ? "sm:col-span-2" : "sm:col-span-3"}`}>
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="year" render={({ field }) => (
                      <FormItem><FormLabel>Year</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="quality" render={({ field }) => (
                      <FormItem><FormLabel>Quality</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? "HD"}>
                          <FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="HD">HD</SelectItem><SelectItem value="4K">4K</SelectItem><SelectItem value="CAM">CAM</SelectItem></SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="genre" render={({ field }) => (
                  <FormItem><FormLabel>Genre</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="director" render={({ field }) => (
                  <FormItem><FormLabel>Director</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} className="rounded-xl" placeholder="2h 15m" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="rating" render={({ field }) => (
                  <FormItem><FormLabel>Age Rating</FormLabel><FormControl><Input {...field} className="rounded-xl" placeholder="PG-13, R…" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} rows={3} className="rounded-xl resize-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="long_description" render={({ field }) => (
                <FormItem><FormLabel>Full Description</FormLabel><FormControl><Textarea {...field} rows={4} className="rounded-xl resize-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem><FormLabel>Tags</FormLabel><FormControl><Input {...field} className="rounded-xl" placeholder="action, thriller, sci-fi" /></FormControl>
                  <FormDescription className="text-xs">Comma separated</FormDescription><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="rounded-2xl border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Media & Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(["poster_url", "backdrop_url"] as const).map(name => (
                  <FormField key={name} control={form.control} name={name} render={({ field }) => (
                    <FormItem><FormLabel>{name === "poster_url" ? "Poster URL" : "Backdrop URL"}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} className="rounded-xl pr-8" placeholder="https://…" />
                          {field.value && <a href={field.value} target="_blank" rel="noreferrer" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /></a>}
                        </div>
                      </FormControl><FormMessage /></FormItem>
                  )} />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="embed_url" render={({ field }) => (
                  <FormItem><FormLabel>Video Embed URL</FormLabel><FormControl><Input {...field} className="rounded-xl" placeholder="https://…" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="trailer_url" render={({ field }) => (
                  <FormItem><FormLabel>Trailer URL</FormLabel><FormControl><Input {...field} className="rounded-xl" placeholder="https://…" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* Publishing */}
          <Card className="rounded-2xl border-card-border">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-xl w-full sm:w-44"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([
                  { name: "is_featured" as const, label: "Featured", desc: "Homepage hero" },
                  { name: "is_trending" as const, label: "Trending", desc: "Trending section" },
                  { name: "is_most_liked" as const, label: "Most Liked", desc: "Most liked section" },
                ]).map(({ name, label, desc }) => (
                  <FormField key={name} control={form.control} name={name} render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border p-3.5">
                      <FormControl><Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} className="rounded-md" /></FormControl>
                      <div className="space-y-0.5 leading-none">
                        <FormLabel className="font-medium">{label}</FormLabel>
                        <FormDescription className="text-xs">{desc}</FormDescription>
                      </div>
                    </FormItem>
                  )} />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={isPending} className="rounded-xl px-6">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Movie"}
            </Button>
            <Link href="/admin/movies"><Button type="button" variant="ghost" className="rounded-xl">Cancel</Button></Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
