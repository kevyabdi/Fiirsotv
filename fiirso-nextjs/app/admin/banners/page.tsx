"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Banner } from "@/lib/types";

export default function AdminBannersPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", link_url: "", button_label: "" });
  const [isAdding, setIsAdding] = useState(false);

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["admin", "banners"],
    queryFn: async () => { const { data } = await supabase.from("banners").select("*").order("sort_order"); return data ?? []; },
  });

  const addBanner = async () => {
    if (!form.title.trim() || !form.image_url.trim()) return;
    setIsAdding(true);
    const { error } = await supabase.from("banners").insert({ ...form, sort_order: banners.length, is_active: true });
    if (error) toast({ title: error.message, variant: "destructive" });
    else { toast({ title: "Banner added" }); queryClient.invalidateQueries({ queryKey: ["admin", "banners"] }); setForm({ title: "", subtitle: "", image_url: "", link_url: "", button_label: "" }); setAdding(false); }
    setIsAdding(false);
  };

  const toggleActive = useMutation({
    mutationFn: async (b: Banner) => { await supabase.from("banners").update({ is_active: !b.is_active }).eq("id", b.id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "banners"] }),
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: number) => { await supabase.from("banners").delete().eq("id", id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "banners"] }); toast({ title: "Banner deleted" }); },
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Banners</h1>
          <Button size="sm" onClick={() => setAdding(a => !a)}><Plus className="mr-1.5 h-4 w-4" /> Add Banner</Button>
        </div>

        {adding && (
          <Card className="rounded-2xl border-card-border">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">New Banner</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label className="text-xs mb-1 block">Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="rounded-xl" /></div>
                <div><Label className="text-xs mb-1 block">Subtitle</Label><Input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} className="rounded-xl" /></div>
                <div className="sm:col-span-2"><Label className="text-xs mb-1 block">Image URL *</Label><Input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://…" className="rounded-xl" /></div>
                <div><Label className="text-xs mb-1 block">Link URL</Label><Input value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} placeholder="https://…" className="rounded-xl" /></div>
                <div><Label className="text-xs mb-1 block">Button Label</Label><Input value={form.button_label} onChange={e => setForm(p => ({ ...p, button_label: e.target.value }))} placeholder="Watch Now" className="rounded-xl" /></div>
              </div>
              {form.image_url && (
                <div className="h-32 rounded-xl overflow-hidden bg-muted">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={addBanner} disabled={isAdding || !form.title.trim() || !form.image_url.trim()} className="rounded-xl">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Banner
                </Button>
                <Button variant="ghost" onClick={() => setAdding(false)} className="rounded-xl">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : banners.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No banners yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banners.map(b => (
              <Card key={b.id} className={`rounded-2xl border-card-border overflow-hidden ${!b.is_active ? "opacity-60" : ""}`}>
                <div className="h-36 bg-muted relative">
                  <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-sm font-bold text-white leading-tight">{b.title}</p>
                    {b.subtitle && <p className="text-[11px] text-white/70">{b.subtitle}</p>}
                  </div>
                </div>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Switch checked={b.is_active} onCheckedChange={() => toggleActive.mutate(b)} />
                    <Label className="text-xs text-muted-foreground">{b.is_active ? "Active" : "Inactive"}</Label>
                  </div>
                  {b.link_url && <a href={b.link_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-4 w-4" /></a>}
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-3.5 w-3.5" /></Button></AlertDialogTrigger>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete banner?</AlertDialogTitle><AlertDialogDescription>Delete &ldquo;{b.title}&rdquo;?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteBanner.mutate(b.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
