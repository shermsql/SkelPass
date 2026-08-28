"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import type { FolderDto, VaultItemListDto } from "@/lib/types";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarDataUrl: string | null;
}

interface DashboardContextValue {
  user: CurrentUser | null;
  userLoading: boolean;
  setUser: (user: CurrentUser | null) => void;
  refreshUser: () => Promise<void>;

  items: VaultItemListDto[];
  itemsLoading: boolean;
  refreshItems: () => Promise<void>;
  setItems: React.Dispatch<React.SetStateAction<VaultItemListDto[]>>;

  folders: FolderDto[];
  foldersLoading: boolean;
  refreshFolders: () => Promise<void>;
  createFolder: (name: string) => Promise<{ ok: boolean; error?: string }>;
  renameFolder: (id: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  deleteFolder: (id: string) => Promise<{ ok: boolean; error?: string }>;

  search: string;
  setSearch: (value: string) => void;

  activeFolder: string | null;
  setActiveFolder: (folder: string | null) => void;
  view: "all" | "favorites";
  setView: (view: "all" | "favorites") => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  logout: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [items, setItems] = useState<VaultItemListDto[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [folders, setFolders] = useState<FolderDto[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [view, setView] = useState<"all" | "favorites">("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    setUserLoading(true);
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } finally {
      setUserLoading(false);
    }
  }, []);

  const refreshItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const response = await fetch("/api/vault");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const refreshFolders = useCallback(async () => {
    setFoldersLoading(true);
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
      }
    } finally {
      setFoldersLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshItems();
    refreshFolders();
  }, [refreshUser, refreshItems, refreshFolders]);

  const createFolder = useCallback(
    async (name: string) => {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.error as string };
      }
      setFolders((prev) =>
        [...prev, data.folder as FolderDto].sort((a, b) => a.name.localeCompare(b.name))
      );
      return { ok: true };
    },
    []
  );

  const renameFolder = useCallback(
    async (id: string, name: string) => {
      const previous = folders.find((f) => f.id === id);
      const response = await fetch(`/api/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.error as string };
      }
      setFolders((prev) =>
        prev
          .map((f) => (f.id === id ? { ...f, name } : f))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      if (previous) {
        setItems((prev) =>
          prev.map((item) =>
            item.folder === previous.name ? { ...item, folder: name } : item
          )
        );
      }
      return { ok: true };
    },
    [folders]
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      const target = folders.find((f) => f.id === id);
      const response = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { ok: false, error: data.error as string };
      }
      setFolders((prev) => prev.filter((f) => f.id !== id));
      if (target) {
        setItems((prev) =>
          prev.map((item) =>
            item.folder === target.name ? { ...item, folder: null } : item
          )
        );
      }
      return { ok: true };
    },
    [folders]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      user,
      userLoading,
      setUser,
      refreshUser,
      items,
      itemsLoading,
      refreshItems,
      setItems,
      folders,
      foldersLoading,
      refreshFolders,
      createFolder,
      renameFolder,
      deleteFolder,
      search,
      setSearch,
      activeFolder,
      setActiveFolder,
      view,
      setView,
      sidebarOpen,
      setSidebarOpen,
      logout,
    }),
    [
      user,
      userLoading,
      refreshUser,
      items,
      itemsLoading,
      refreshItems,
      folders,
      foldersLoading,
      refreshFolders,
      createFolder,
      renameFolder,
      deleteFolder,
      search,
      activeFolder,
      view,
      sidebarOpen,
      logout,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}
