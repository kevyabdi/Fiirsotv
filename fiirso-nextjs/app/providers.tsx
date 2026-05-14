"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { WatchHistoryProvider } from "@/contexts/WatchHistoryContext";
import { MyListProvider } from "@/contexts/MyListContext";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WatchHistoryProvider>
            <MyListProvider>
              {children}
              <Toaster />
            </MyListProvider>
          </WatchHistoryProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
