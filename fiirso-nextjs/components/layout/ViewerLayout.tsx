"use client";

import { ContentLibraryProvider } from "@/contexts/ContentLibraryContext";
import { BannersProvider } from "@/contexts/BannersContext";
import { Navbar } from "./Navbar";

export function ViewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentLibraryProvider>
      <BannersProvider>
        <main className="min-h-screen pb-[80px] lg:pb-0">
          {children}
        </main>
        <Navbar />
      </BannersProvider>
    </ContentLibraryProvider>
  );
}
