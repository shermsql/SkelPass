"use client";

import { useMemo, useState } from "react";

import Product from "@/components/Product/Product";
import VaultModal from "@/components/VaultModal/VaultModal";

import { useDashboard } from "./DashboardContext";

import type { VaultItemDetailDto, VaultItemListDto } from "@/lib/types";

import styles from "./Dashboard.module.css";

export default function DashboardPage() {
  const {
    user,
    items,
    itemsLoading,
    refreshItems,
    setItems,
    folders,
    search,
    activeFolder,
    setActiveFolder,
    view,
    setView,
  } = useDashboard();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<VaultItemDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [initialPassword, setInitialPassword] = useState<string | null>(null);

  function openCreateModal() {
    setActiveItem(null);
    setInitialPassword(null);
    setModalOpen(true);
  }

  async function openCreateModalWithGenerated() {
    setActiveItem(null);
    setModalOpen(true);
    try {
      const response = await fetch("/api/vault/generate?length=20");
      if (response.ok) {
        const data = await response.json();
        setInitialPassword(data.password);
      }
    } catch {
      setInitialPassword(null);
    }
  }

  async function openItem(item: VaultItemListDto) {
    setDetailLoading(true);
    setModalOpen(true);
    try {
      const response = await fetch(`/api/vault/${item.id}`);
      if (response.ok) {
        const data = await response.json();
        setActiveItem(data.item);
      }
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleFavorite(item: VaultItemListDto) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, favorite: !i.favorite } : i))
    );
    try {
      const response = await fetch(`/api/vault/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !item.favorite }),
      });
      if (!response.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, favorite: item.favorite } : i))
        );
      }
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, favorite: item.favorite } : i))
      );
    }
  }

  function closeModal() {
    setModalOpen(false);
    setActiveItem(null);
    setInitialPassword(null);
  }

  function handleSaved() {
    closeModal();
    refreshItems();
  }

  function handleDeleted() {
    closeModal();
    refreshItems();
  }

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (view === "favorites" && !item.favorite) return false;
      if (activeFolder && item.folder !== activeFolder) return false;
      if (!query) return true;
      const haystack = [item.service, item.website, item.username, item.folder]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [items, search, activeFolder, view]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      if (!item.folder) continue;
      counts[item.folder] = (counts[item.folder] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const strongCount = items.filter((i) => i.passwordStrength === "strong").length;
  const weakCount = items.filter((i) => i.passwordStrength === "weak").length;
  const healthScore =
    items.length === 0
      ? 100
      : Math.round((strongCount / items.length) * 70 + 30);

  let sectionTitle = "Recent passwords";
  if (view === "favorites") sectionTitle = "Favorite Passwords";
  else if (activeFolder) sectionTitle = activeFolder;

  return (
    <div className={styles.content}>
      <section className={styles.heading}>
        <div>
          <div className={styles.eyebrow}>A calmer place for your credentials.</div>
          <h1>
            {user ? (
              <>Welcome back, <em>{user.name.split(" ")[0]}.</em></>
            ) : (
              <>
                Your digital life,
                <br />
                <em>kept together.</em>
              </>
            )}
          </h1>
        </div>
        <div className={styles.headingActions}>
          <span className={styles.headingNote}>
            Passwords, notes and accounts — together, and out of your way.
          </span>
          <button className={styles.addButton} onClick={openCreateModal}>
            <svg>
              <use href="#Plus" />
            </svg>
            Add Password
          </button>
        </div>
      </section>

      <div className={styles.workspace}>
        <section>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>
              {sectionTitle}
              {activeFolder && (
                <button
                  type="button"
                  className={styles.clearFilter}
                  onClick={() => setActiveFolder(null)}
                >
                  Clear
                </button>
              )}
            </div>
            <div className={styles.sectionMeta}>
              {itemsLoading
                ? "Loading…"
                : `${filteredItems.length} Item${filteredItems.length === 1 ? "" : "s"}`}
            </div>
          </div>

          <div className={styles.vaultList}>
            {filteredItems.map((item) => (
              <Product
                key={item.id}
                item={item}
                onSelect={openItem}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>

          {!itemsLoading && filteredItems.length === 0 && (
            <div className={styles.noResults}>
              {items.length === 0
                ? "Your vault is empty. Add your first password."
                : "No passwords found."}
            </div>
          )}

          <section className={styles.folderSection}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitle}>Folders</div>
              <div className={styles.sectionMeta}>
                {folders.length} Folder{folders.length === 1 ? "" : "s"}
              </div>
            </div>
            {folders.length > 0 ? (
              <div className={styles.folderGrid}>
                {folders.map((folder) => (
                  <button
                    type="button"
                    key={folder.id}
                    className={styles.folderCard}
                    onClick={() => {
                      setActiveFolder(folder.name);
                      setView("all");
                    }}
                  >
                    <svg>
                      <use href="#Icon-Folder" />
                    </svg>
                    <strong>{folder.name}</strong>
                    <span>
                      {folderCounts[folder.name] ?? 0} Password
                      {(folderCounts[folder.name] ?? 0) === 1 ? "" : "s"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                No folders yet. Add one from the sidebar to start organizing your vault.
              </div>
            )}
          </section>
        </section>

        <aside className={styles.rightColumn}>
          <section>
            <div className={styles.securityHeader}>Vault Health</div>
            <div className={styles.securityScore}>
              <div className={styles.score}>
                <strong>{healthScore}</strong>
              </div>
              <div className={styles.scoreCopy}>
                <strong>
                  {healthScore >= 80
                    ? "Your vault looks good."
                    : "Your vault needs some attention."}
                </strong>
                <span>
                  {weakCount > 0
                    ? `${weakCount} account${weakCount === 1 ? "" : "s"} need${weakCount === 1 ? "s" : ""} your attention.`
                    : "All your accounts look secure."}
                </span>
              </div>
            </div>
            <div className={styles.securityRow}>
              <span className={styles.securityRowLabel}>Strong Passwords</span>
              <span className={styles.securityRowValue}>
                {strongCount} / {items.length}
              </span>
            </div>
            <div className={`${styles.securityRow} ${weakCount > 0 ? styles.warning : ""}`}>
              <span className={styles.securityRowLabel}>Weak Passwords</span>
              <span className={styles.securityRowValue}>
                {weakCount} Item{weakCount === 1 ? "" : "s"}
              </span>
            </div>
          </section>

          <section className={styles.quick}>
            <div className={styles.quickTitle}>Quick Add</div>
            <div className={styles.quickDescription}>
              Keep everything important in one calm place.
            </div>
            <div className={styles.quickList}>
              <button className={styles.quickButton} onClick={openCreateModal}>
                <span className={styles.quickIcon}>
                  <svg>
                    <use href="#Key" />
                  </svg>
                </span>
                <span>New Password</span>
              </button>
              <button className={styles.quickButton} onClick={openCreateModalWithGenerated}>
                <span className={styles.quickIcon}>
                  <svg>
                    <use href="#Wand" />
                  </svg>
                </span>
                <span>Generate Password</span>
              </button>
            </div>
          </section>
        </aside>
      </div>

      <VaultModal
        open={modalOpen}
        item={detailLoading ? null : activeItem}
        folders={folders}
        initialPassword={initialPassword}
        onClose={closeModal}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
