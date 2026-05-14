"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: async () => { const { data } = await supabase.from("categories").select("*").order("name"); return data ?? []; },
  });

  const addCategory = async () => {
    if (!name.trim()) return;
    setIsAdding(true);
    const autoSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = await supabase.from("categories").insert({ name: name.trim(), slug: autoSlug });
    if (error) toast({ title: error.message, variant: "destructive" });
    else { toast({ title: "Category added" }); queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }); setName(""); setSlug(""); }
    setIsAdding(false);
  };

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => { await supabase.from("categories").delete().eq("id", id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }); toast({ title: "Category deleted" }); },
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Categories</h1>

        <div className="flex flex-col sm:flex-row gap-2 p-4 rounded-2xl border border-border bg-card">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Category name *" className="rounded-xl flex-1" />
          <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="slug (auto-generated)" className="rounded-xl flex-1" />
          <Button onClick={addCategory} disabled={isAdding || !name.trim()} className="rounded-xl shrink-0">
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1.5" /> Add</>}
          </Button>
        </div>

        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={3} className="h-24 text-center"><div className="inline-flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div></TableCell></TableRow> :
                categories.length === 0 ? <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No categories yet.</TableCell></TableRow> :
                categories.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{cat.slug}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete category?</AlertDialogTitle><AlertDialogDescription>Delete &ldquo;{cat.name}&rdquo;?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteCategory.mutate(cat.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
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
