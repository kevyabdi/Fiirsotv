"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { MediaItem } from "@/lib/types";

interface WatchEntry { item: MediaItem; progress: number; watchedAt: number }
interface WatchHistoryContextValue {
  history: WatchEntry[];
  addToHistory: (item: MediaItem, progress?: number) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

const WatchHistoryContext = createContext<WatchHistoryContextValue>({
  history: [],
  addToHistory: () => {},
  removeFromHistory: () => {},
  clearHistory: () => {},
});

const STORAGE_KEY = "fiirso_watch_history";

export function WatchHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<WatchEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored) as WatchEntry[]);
    } catch {}
  }, []);

  const save = (next: WatchEntry[]) => {
    setHistory(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 20))); } catch {}
  };

  const addToHistory = (item: MediaItem, progress = 0.05) => {
    setHistory(prev => {
      const filtered = prev.filter(e => e.item.id !== item.id);
      const next = [{ item, progress, watchedAt: Date.now() }, ...filtered].slice(0, 20);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeFromHistory = (id: string) => save(history.filter(e => e.item.id !== id));
  const clearHistory = () => save([]);

  return (
    <WatchHistoryContext.Provider value={{ history, addToHistory, removeFromHistory, clearHistory }}>
      {children}
    </WatchHistoryContext.Provider>
  );
}

export function useWatchHistory() { return useContext(WatchHistoryContext); }
