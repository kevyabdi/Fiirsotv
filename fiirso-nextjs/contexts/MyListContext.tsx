"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { MediaItem } from "@/lib/types";

interface MyListContextValue {
  list: MediaItem[];
  isInList: (id: string) => boolean;
  toggleList: (item: MediaItem) => void;
  clearList: () => void;
}

const MyListContext = createContext<MyListContextValue>({
  list: [], isInList: () => false, toggleList: () => {}, clearList: () => {},
});

const STORAGE_KEY = "fiirso_my_list";

export function MyListProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<MediaItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setList(JSON.parse(stored) as MediaItem[]);
    } catch {}
  }, []);

  const save = (next: MediaItem[]) => {
    setList(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const isInList = (id: string) => list.some(i => i.id === id);
  const toggleList = (item: MediaItem) => {
    if (isInList(item.id)) save(list.filter(i => i.id !== item.id));
    else save([...list, item]);
  };
  const clearList = () => save([]);

  return (
    <MyListContext.Provider value={{ list, isInList, toggleList, clearList }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() { return useContext(MyListContext); }
