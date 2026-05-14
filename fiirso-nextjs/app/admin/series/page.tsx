"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, CheckCircle, XCircle, Layers } from "lucide-react";
import type { Series } from "@/lib/types";

export default function AdminSeriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: series = [], isLoading } = useQuery<Series[]>({
    queryKey: ["admin", "series", statusFilter],
    queryFn: async () => {
      let q = supabase.from("series").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data } = await q;
      return data ?? [];
    },
  });

  const filtered = series.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.genre.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = useMutation({
    mutationFn: async (s: Series) => { await supabase.from("series").update({ status: s.status === "published" ? "draft" : "published" }).eq("id", s.id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "series"] }); toast({ title: "Status updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteSeries = useMutation({
    mutationFn: async (id: number) => { await supabase.from("series").delete().eq("id", id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "series"] }); toast({ title: "Series deleted" }); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">TV Series</h1>
          <Link href="/admin/series/new"><Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Series</Button></Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search series..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Seasons</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>) :
                filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No series found.</TableCell></TableRow> :
                filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.title}</TableCell>
                    <TableCell>{s.year}</TableCell>
                    <TableCell>{s.genre}</TableCell>
                    <TableCell>{s.seasons_count}</TableCell>
                    <TableCell><Badge variant={s.status === "published" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => toggleStatus.mutate(s)}>
                          {s.status === "published" ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Link href={`/admin/series/${s.id}/edit`}><Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button></Link>
                        <Link href={`/admin/series/${s.id}/seasons`}><Button variant="outline" size="icon" title="Seasons"><Layers className="h-4 w-4" /></Button></Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete series?</AlertDialogTitle><AlertDialogDescription>This will permanently delete &ldquo;{s.title}&rdquo; and all its seasons and episodes.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteSeries.mutate(s.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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
