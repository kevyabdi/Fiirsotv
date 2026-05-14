"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { Movie } from "@/lib/types";

export default function AdminMoviesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: movies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ["admin", "movies", statusFilter],
    queryFn: async () => {
      let q = supabase.from("movies").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data } = await q;
      return data ?? [];
    },
  });

  const filtered = movies.filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.genre.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = useMutation({
    mutationFn: async (movie: Movie) => {
      const newStatus = movie.status === "published" ? "draft" : "published";
      await supabase.from("movies").update({ status: newStatus }).eq("id", movie.id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "movies"] }); toast({ title: "Status updated" }); },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const deleteMovie = useMutation({
    mutationFn: async (id: number) => { await supabase.from("movies").delete().eq("id", id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "movies"] }); toast({ title: "Movie deleted" }); },
    onError: () => toast({ title: "Failed to delete movie", variant: "destructive" }),
  });

  const allIds = filtered.map(m => m.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(allIds));
  const toggleOne = (id: number) => { const next = new Set(selected); if (next.has(id)) next.delete(id); else next.add(id); setSelected(next); };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Movies</h1>
          <Link href="/admin/movies/new"><Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Movie</Button></Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search movies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>) :
            filtered.length === 0 ? <p className="text-center text-muted-foreground py-10">No movies found.</p> :
            filtered.map(movie => (
              <Card key={movie.id} className={selected.has(movie.id) ? "ring-1 ring-primary" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={selected.has(movie.id)} onCheckedChange={() => toggleOne(movie.id)} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{movie.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{movie.year} · {movie.genre}</p>
                      <Badge variant={movie.status === "published" ? "default" : "secondary"} className="text-xs mt-2">{movie.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="icon" onClick={() => toggleStatus.mutate(movie)} className="h-8 w-8">
                        {movie.status === "published" ? <XCircle className="h-3.5 w-3.5 text-destructive" /> : <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                      </Button>
                      <Link href={`/admin/movies/${movie.id}/edit`}><Button variant="outline" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button></Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete movie?</AlertDialogTitle><AlertDialogDescription>This will permanently delete &ldquo;{movie.title}&rdquo;.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMovie.mutate(movie.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>) :
                filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No movies found.</TableCell></TableRow> :
                filtered.map(movie => (
                  <TableRow key={movie.id} className={selected.has(movie.id) ? "bg-primary/5" : ""}>
                    <TableCell><Checkbox checked={selected.has(movie.id)} onCheckedChange={() => toggleOne(movie.id)} /></TableCell>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell>{movie.year}</TableCell>
                    <TableCell>{movie.genre}</TableCell>
                    <TableCell><Badge variant={movie.status === "published" ? "default" : "secondary"}>{movie.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => toggleStatus.mutate(movie)} title={movie.status === "published" ? "Set to Draft" : "Publish"}>
                          {movie.status === "published" ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Link href={`/admin/movies/${movie.id}/edit`}><Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete movie?</AlertDialogTitle><AlertDialogDescription>This will permanently delete &ldquo;{movie.title}&rdquo;.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMovie.mutate(movie.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
