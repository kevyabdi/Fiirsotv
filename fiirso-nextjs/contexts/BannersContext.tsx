"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Banner } from "@/lib/types";

interface BannersContextValue { banners: Banner[]; isLoading: boolean }
const BannersContext = createContext<BannersContextValue>({ banners: [], isLoading: false });

export function BannersProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["banners", "active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    staleTime: 30_000,
  });

  return (
    <BannersContext.Provider value={{ banners, isLoading }}>
      {children}
    </BannersContext.Provider>
  );
}

export function useBanners() { return useContext(BannersContext); }
