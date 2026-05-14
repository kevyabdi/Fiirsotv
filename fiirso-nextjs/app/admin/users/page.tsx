"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, ShieldOff } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => { const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }); return data ?? []; },
  });

  const filtered = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!search) return true;
    return u.email.toLowerCase().includes(search.toLowerCase()) || (u.name ?? "").toLowerCase().includes(search.toLowerCase());
  });

  const toggleBan = useMutation({
    mutationFn: async (u: Profile) => { await supabase.from("profiles").update({ is_active: !u.is_active }).eq("id", u.id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "users"] }); toast({ title: "User updated" }); },
  });

  const setAdmin = useMutation({
    mutationFn: async (u: Profile) => { await supabase.from("profiles").update({ role: u.role === "admin" ? "viewer" : "admin" }).eq("id", u.id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "users"] }); toast({ title: "Role updated" }); },
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8" /></div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>) :
                filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No users found.</TableCell></TableRow> :
                filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{u.name ?? "(no name)"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></TableCell>
                    <TableCell><span className="text-xs text-muted-foreground capitalize">{u.plan}</span></TableCell>
                    <TableCell><Badge variant={u.is_active ? "default" : "destructive"}>{u.is_active ? "Active" : "Banned"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => setAdmin.mutate(u)} title={u.role === "admin" ? "Remove admin" : "Make admin"}>
                          {u.role === "admin" ? <ShieldOff className="h-4 w-4 text-destructive" /> : <Shield className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button variant={u.is_active ? "destructive" : "outline"} size="sm" className="text-xs" onClick={() => toggleBan.mutate(u)}>
                          {u.is_active ? "Ban" : "Unban"}
                        </Button>
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
