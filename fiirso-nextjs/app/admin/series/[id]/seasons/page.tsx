"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Trash2, Layers, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Season, Series } from "@/lib/types";

export default function SeasonsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seriesId = parseInt(id);
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data: series } = useQuery<Series>({
    queryKey: ["admin", "series", seriesId],
    queryFn: async () => { const { data } = await supabase.from("series").select("*").eq("id", seriesId).single(); return data!; },
  });

  const { data: seasons = [], isLoading } = useQuery<Season[]>({
    queryKey: ["admin", "seasons", seriesId],
    queryFn: async () => { const { data } = await supabase.from("seasons").select("*").eq("series_id", seriesId).order("season_number"); return data ?? []; },
  });

  const addSeason = async () => {
    setIsAdding(true);
    const nextNum = (seasons[seasons.length - 1]?.season_number ?? 0) + 1;
    const { error } = await supabase.from("seasons").insert({ series_id: seriesId, season_number: nextNum, title: newTitle || `Season ${nextNum}` });
    if (error) toast({ title: "Failed to add season", variant: "destructive" });
    else { toast({ title: "Season added" }); queryClient.invalidateQueries({ queryKey: ["admin", "seasons", seriesId] }); setAdding(false); setNewTitle(""); }
    setIsAdding(false);
  };

  const deleteSeason = useMutation({
    mutationFn: async (id: number) => { await supabase.from("seasons").delete().eq("id", id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "seasons", seriesId] }); toast({ title: "Season deleted" }); },
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/series"><Button variant="outline" size="icon" className="rounded-xl h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Seasons</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{series?.title}</p>
          </div>
          <Button size="sm" className="ml-auto" onClick={() => setAdding(a => !a)}><Plus className="mr-1.5 h-4 w-4" /> Add Season</Button>
        </div>

        {adding && (
          <div className="flex gap-2">
            <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Season title (optional)" className="rounded-xl" />
            <Button onClick={addSeason} disabled={isAdding} className="rounded-xl shrink-0">
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        )}

        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={3}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell></TableRow>) :
                seasons.length === 0 ? <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No seasons yet. Click &ldquo;Add Season&rdquo; to create one.</TableCell></TableRow> :
                seasons.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.season_number}</TableCell>
                    <TableCell>{s.title ?? `Season ${s.season_number}`}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/seasons/${s.id}/episodes`}><Button variant="outline" size="icon" title="Episodes"><Layers className="h-4 w-4" /></Button></Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete season?</AlertDialogTitle><AlertDialogDescription>All episodes in this season will also be deleted.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteSeason.mutate(s.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
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
