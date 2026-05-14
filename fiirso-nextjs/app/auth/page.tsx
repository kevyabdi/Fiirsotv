"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Clapperboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast({ title: "Welcome back!" });
      } else {
        if (!name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
        await register(email, password, name);
        toast({ title: "Account created!" });
      }
      router.push("/");
    } catch (err) {
      toast({ title: mode === "login" ? "Login failed" : "Registration failed", description: err instanceof Error ? err.message : "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-900/30 mb-4">
            <Clapperboard className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Fiirso</h1>
          <p className="text-sm text-foreground/40 mt-1">{mode === "login" ? "Sign in to your account" : "Create your account"}</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-foreground/[0.06] p-1 mb-6">
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === m ? "bg-background shadow-sm text-foreground" : "text-foreground/50 hover:text-foreground/70"}`}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {mode === "register" && (
              <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" className="w-full px-3 py-2.5 rounded-xl bg-foreground/[0.06] border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-foreground/30" />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-3 py-2.5 rounded-xl bg-foreground/[0.06] border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-foreground/30" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="w-full px-3 py-2.5 pr-10 rounded-xl bg-foreground/[0.06] border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-foreground/30" />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/40 mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(m => m === "login" ? "register" : "login")} className="text-foreground/70 hover:text-foreground font-medium transition-colors">
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
