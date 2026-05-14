"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Lock, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { ViewerLayout } from "@/components/layout/ViewerLayout";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, profile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    toast({ title: "Signed out" });
    router.push("/");
  };

  return (
    <ViewerLayout>
      <div className="px-5 lg:px-12 pt-8 pb-28 lg:pb-10 max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Profile</h1>

        {user ? (
          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-card-border">
              <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-primary">
                  {(profile?.name ?? user.email ?? "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{profile?.name ?? "User"}</p>
                <p className="text-sm text-foreground/50 truncate">{user.email}</p>
                <span className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${profile?.plan === "premium" ? "bg-amber-500/20 text-amber-400" : "bg-foreground/[0.08] text-foreground/50"}`}>
                  {profile?.plan ?? "free"} plan
                </span>
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-2xl bg-card border border-card-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="h-4 w-4 text-foreground/60" /> : <Sun className="h-4 w-4 text-foreground/60" />}
                  <span className="text-sm font-medium">Dark Mode</span>
                </div>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`relative w-11 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-foreground/20"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              <button onClick={() => router.push("/subscribe")} className="w-full p-4 flex items-center gap-3 hover:bg-foreground/[0.04] transition-colors text-left">
                <User className="h-4 w-4 text-foreground/60" />
                <span className="text-sm font-medium">Upgrade Plan</span>
              </button>
            </div>

            {/* Sign Out */}
            <button onClick={handleLogout} disabled={loggingOut} className="w-full py-3 rounded-2xl bg-card border border-card-border flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="h-4 w-4" />
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-foreground/30 text-center">
            <User className="w-12 h-12 mb-4" strokeWidth={1.5} />
            <p className="text-lg font-semibold mb-1">Not signed in</p>
            <p className="text-sm mb-6">Sign in to access your profile</p>
            <button onClick={() => router.push("/auth")} className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Sign In
            </button>
          </div>
        )}
      </div>
    </ViewerLayout>
  );
}
