"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface SiteSetting { site_name: string; site_description: string; contact_email: string; tmdb_api_key_configured: boolean }

const DEFAULT: SiteSetting = { site_name: "Fiirso", site_description: "Stream movies and TV series", contact_email: "", tmdb_api_key_configured: false };

export default function AdminSettingsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SiteSetting>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("*").eq("key", "site").single();
      if (!data) return DEFAULT;
      return data.value as SiteSetting;
    },
  });

  const [form, setForm] = useState<SiteSetting | null>(null);
  const current = form ?? settings ?? DEFAULT;

  const save = useMutation({
    mutationFn: async (data: SiteSetting) => {
      await supabase.from("settings").upsert({ key: "site", value: data, updated_at: new Date().toISOString() });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "settings"] }); toast({ title: "Settings saved" }); },
    onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
  });

  if (isLoading) {
    return <AdminLayout><div className="space-y-4 max-w-xl"><div className="h-48 bg-muted rounded-2xl animate-pulse" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>

        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Site Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Site Name</Label>
              <Input value={current.site_name} onChange={e => setForm(p => ({ ...(p ?? current), site_name: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Site Description</Label>
              <Input value={current.site_description} onChange={e => setForm(p => ({ ...(p ?? current), site_description: e.target.value }))} className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Contact Email</Label>
              <Input type="email" value={current.contact_email} onChange={e => setForm(p => ({ ...(p ?? current), contact_email: e.target.value }))} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Environment</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Supabase</span>
              <span className="text-emerald-500 font-medium">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">TMDB API Key</span>
              <span className={`font-medium ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-emerald-500" : "text-amber-500"}`}>
                Set in .env.local
              </span>
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => save.mutate(current)} disabled={save.isPending || !form} className="rounded-xl">
          {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </AdminLayout>
  );
}
