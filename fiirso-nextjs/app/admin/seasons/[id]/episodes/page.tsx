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
import { ArrowLeft, Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Episode, Season } from "@/lib/types";

export default function EpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const seasonId = parseInt(id);
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newEp, setNewEp] = useState({ title: "", duration: "", embed_url: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState({ title: "", duration: "", embed_url: "" });

  const { data: season } = useQuery<Season>({
    queryKey: ["admin", "season", seasonId],
    queryFn: async () => { const { data } = await supabase.from("seasons").select("*").eq("id", seasonId).single(); return data!; },
  });

  const { data: episodes = [], isLoading } = useQuery<Episode[]>({
    queryKey: ["admin", "episodes", seasonId],
    queryFn: async () => { const { data } = await supabase.from("episodes").select("*").eq("season_id", seasonId).order("episode_number"); return data ?? []; },
  });

  const addEpisode = async () => {
    if (!newEp.title.trim()) return;
    setIsAdding(true);
    const nextNum = (episodes[episodes.length - 1]?.episode_number ?? 0) + 1;
    const { error } = await supabase.from("episodes").insert({ season_id: seasonId, episode_number: nextNum, title: newEp.title, duration: newEp.duration || null, embed_url: newEp.embed_url || null });
    if (error) toast({ title: "Failed to add episode", variant: "destructive" });
    else { toast({ title: "Episode added" }); queryClient.invalidateQueries({ queryKey: ["admin", "episodes", seasonId] }); setAdding(false); setNewEp({ title: "", duration: "", embed_url: "" }); }
    setIsAdding(false);
  };

  const saveEdit = async (id: number) => {
    await supabase.from("episodes").update({ title: editData.title, duration: editData.duration || null, embed_url: editData.embed_url || null }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin", "episodes", seasonId] });
    setEditing(null);
    toast({ title: "Episode updated" });
  };

  const deleteEpisode = useMutation({
    mutationFn: async (id: number) => { await supabase.from("episodes").delete().eq("id", id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "episodes", seasonId] }); toast({ title: "Episode deleted" }); },
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-xl h-9 w-9" onClick={() => history.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Episodes</h1>
            <p className="text-xs text-muted-foreground">{season ? `Season ${season.season_number}` : "Loading…"}</p>
          </div>
          <Button size="sm" className="ml-auto" onClick={() => setAdding(a => !a)}><Plus className="mr-1.5 h-4 w-4" /> Add Episode</Button>
        </div>

        {adding && (
          <div className="flex flex-col sm:flex-row gap-2 p-4 rounded-2xl border border-border bg-card">
            <Input value={newEp.title} onChange={e => setNewEp(p => ({ ...p, title: e.target.value }))} placeholder="Episode title *" className="rounded-xl flex-1" />
            <Input value={newEp.duration} onChange={e => setNewEp(p => ({ ...p, duration: e.target.value }))} placeholder="Duration (45m)" className="rounded-xl w-32" />
            <Input value={newEp.embed_url} onChange={e => setNewEp(p => ({ ...p, embed_url: e.target.value }))} placeholder="Embed URL" className="rounded-xl flex-1" />
            <Button onClick={addEpisode} disabled={isAdding || !newEp.title.trim()} className="rounded-xl shrink-0">
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        )}

        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell></TableRow>) :
                episodes.length === 0 ? <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No episodes yet.</TableCell></TableRow> :
                episodes.map(ep => (
                  <TableRow key={ep.id}>
                    <TableCell className="font-medium text-muted-foreground">{ep.episode_number}</TableCell>
                    <TableCell>
                      {editing === ep.id ? (
                        <Input value={editData.title} onChange={e => setEditData(p => ({ ...p, title: e.target.value }))} className="rounded-lg h-8 text-sm" />
                      ) : ep.title}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {editing === ep.id ? (
                        <Input value={editData.duration} onChange={e => setEditData(p => ({ ...p, duration: e.target.value }))} className="rounded-lg h-8 text-sm w-24" placeholder="45m" />
                      ) : ep.duration ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {editing === ep.id ? (
                          <>
                            <Button size="icon" className="h-8 w-8 rounded-lg" onClick={() => saveEdit(ep.id)}><Check className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditing(null)}><X className="h-3.5 w-3.5" /></Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setEditing(ep.id); setEditData({ title: ep.title, duration: ep.duration ?? "", embed_url: ep.embed_url ?? "" }); }}><Pencil className="h-3.5 w-3.5" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                              <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete episode?</AlertDialogTitle><AlertDialogDescription>This will permanently delete &ldquo;{ep.title}&rdquo;.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteEpisode.mutate(ep.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
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
