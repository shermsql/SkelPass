"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";
import { useDashboard } from "@/app/dashboard/DashboardContext";

import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    items,
    folders,
    foldersLoading,
    activeFolder,
    setActiveFolder,
    view,
    setView,
    sidebarOpen,
    setSidebarOpen,
    createFolder,
    deleteFolder,
    logout,
  } = useDashboard();

  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);
  const [savingFolder, setSavingFolder] = useState(false);

  const onVaultPage = pathname === "/dashboard";

  const favoriteCount = useMemo(
    () => items.filter((item) => item.favorite).length,
    [items]
  );

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      if (!item.folder) continue;
      counts[item.folder] = (counts[item.folder] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  function goToVault(nextView: "all" | "favorites", folder: string | null) {
    setView(nextView);
    setActiveFolder(folder);
    setSidebarOpen(false);
    if (!onVaultPage) router.push("/dashboard");
  }

  async function handleAddFolder(event: React.FormEvent) {
    event.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;

    setSavingFolder(true);
    setFolderError(null);
    const result = await createFolder(name);
    setSavingFolder(false);

    if (!result.ok) {
      setFolderError(result.error ?? "Could not create the folder.");
      return;
    }
    setNewFolderName("");
    setAddingFolder(false);
  }

  async function handleDeleteFolder(event: React.MouseEvent, id: string, name: string) {
    event.preventDefault();
    event.stopPropagation();
    const count = folderCounts[name] ?? 0;
    const confirmed = window.confirm(
      count > 0
        ? `Delete "${name}"? ${count} password${count === 1 ? "" : "s"} inside will become uncategorized.`
        : `Delete "${name}"?`
    );
    if (!confirmed) return;

    const result = await deleteFolder(id);
    if (!result.ok) {
      window.alert(result.error ?? "Could not delete the folder.");
      return;
    }
    if (activeFolder === name) setActiveFolder(null);
  }

  const initials = user
    ? user.name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "SK";

  return (
    <>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <Link href="/" className={styles.logo}>
          <svg>
            <use href="#Icon-Logo" />
          </svg>
          SkelPass
        </Link>

        <div className={styles.navGroup}>
          <div className={styles.navLabel}>Vault</div>
          <nav className={styles.nav}>
            <button
              type="button"
              className={`${styles.navLink} ${onVaultPage && view === "all" && !activeFolder ? styles.navLinkActive : ""
                }`}
              onClick={() => goToVault("all", null)}
            >
              <svg>
                <use href="#Key" />
              </svg>
              All Passwords
              <span className={styles.navCount}>{items.length}</span>
            </button>
            <button
              type="button"
              className={`${styles.navLink} ${onVaultPage && view === "favorites" ? styles.navLinkActive : ""
                }`}
              onClick={() => goToVault("favorites", null)}
            >
              <svg>
                <use href="#Star" />
              </svg>
              Favorites
              <span className={styles.navCount}>{favoriteCount}</span>
            </button>
          </nav>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navLabelRow}>
            <span className={styles.navLabel}>Folders</span>
            <button
              type="button"
              className={styles.folderAddToggle}
              aria-label="Add folder"
              onClick={() => {
                setAddingFolder((v) => !v);
                setFolderError(null);
              }}
            >
              <svg>
                <use href="#Plus" />
              </svg>
            </button>
          </div>

          <div className={styles.folders}>
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`${styles.folder} ${onVaultPage && activeFolder === folder.name ? styles.folderActive : ""
                  }`}
                role="button"
                tabIndex={0}
                onClick={() => goToVault("all", folder.name)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    goToVault("all", folder.name);
                  }
                }}
              >
                <span className={styles.folderDot} />
                <span className={styles.folderName}>{folder.name}</span>
                <span className={styles.folderCount}>
                  {folderCounts[folder.name] ?? 0}
                </span>
                <button
                  type="button"
                  className={styles.folderDelete}
                  aria-label={`Delete Folder ${folder.name}`}
                  onClick={(event) => handleDeleteFolder(event, folder.id, folder.name)}
                >
                  <svg>
                    <use href="#Trash" />
                  </svg>
                </button>
              </div>
            ))}

            {!foldersLoading && folders.length === 0 && !addingFolder && (
              <div className={styles.foldersEmpty}>No folders yet.</div>
            )}

            {addingFolder && (
              <form className={styles.folderForm} onSubmit={handleAddFolder}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Folder Name"
                  value={newFolderName}
                  maxLength={40}
                  onChange={(event) => setNewFolderName(event.target.value)}
                />
                <div className={styles.folderFormActions}>
                  <button type="submit" disabled={savingFolder || !newFolderName.trim()}>
                    {savingFolder ? "Adding…" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingFolder(false);
                      setNewFolderName("");
                      setFolderError(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {folderError && <div className={styles.folderFormError}>{folderError}</div>}
              </form>
            )}
          </div>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navLabel}>Account</div>
          <nav className={styles.nav}>
            <Link
              href="/dashboard/account"
              className={`${styles.navLink} ${pathname === "/dashboard/account" ? styles.navLinkActive : ""
                }`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg>
                <use href="#User" />
              </svg>
              Settings
            </Link>
            <button type="button" className={styles.navLink} onClick={logout}>
              <svg>
                <use href="#Logout" />
              </svg>
              Log Out
            </button>
          </nav>
        </div>

        <Link
          href="/dashboard/account"
          className={styles.account}
          onClick={() => setSidebarOpen(false)}
        >
          <div className={styles.avatar}>
            {user?.avatarDataUrl ? (
              <Image
                src={user.avatarDataUrl}
                alt=""
                width={29}
                height={29}
                className={styles.avatarImage}
                unoptimized
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className={styles.accountName}>{user?.name ?? "Your Account"}</div>
            <div className={styles.accountEmail}>{user?.email ?? ""}</div>
          </div>
        </Link>
      </aside>

      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayActive : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
    </>
  );
}
