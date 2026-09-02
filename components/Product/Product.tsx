"use client";

import type { VaultItemListDto } from "@/lib/types";

import styles from "./Product.module.css";

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US");
}

interface ProductProps {
  item: VaultItemListDto;
  onSelect: (item: VaultItemListDto) => void;
  onToggleFavorite: (item: VaultItemListDto) => void;
}

export default function Product({ item, onSelect, onToggleFavorite }: ProductProps) {
  const initial = item.service.trim().charAt(0).toUpperCase() || "?";
  const hostname = item.website
    ? item.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;

  return (
    <article className={styles.item}>
      <button
        type="button"
        className={styles.itemMain}
        onClick={() => onSelect(item)}
        aria-label={`Open Details For ${item.service}`}
      >
        <div className={styles.itemIcon}>{initial}</div>
        <div className={styles.itemBody}>
          <div className={styles.itemNameRow}>
            <div className={styles.itemName}>{item.service}</div>
            {item.hasNote && (
              <svg className={styles.noteIcon} width="12" height="12" viewBox="0 0 20 20">
                <title>Has a note</title>
                <path
                  d="M5 2.5h7l3 3v12H5V2.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M12 2.5v3h3M7.5 9h5M7.5 12h5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            )}
          </div>
          <div className={styles.itemUrl}>
            {[hostname, item.folder].filter(Boolean).join(" · ")}
          </div>
        </div>
      </button>

      <div className={styles.itemActions}>
        <span className={styles.itemDate}>{formatRelativeDate(item.updatedAt)}</span>
        <button
          type="button"
          className={`${styles.favorite} ${item.favorite ? styles.favoriteActive : ""}`}
          aria-label={item.favorite ? "Remove From Favorites" : "Add To Favorites"}
          onClick={() => onToggleFavorite(item)}
        >
          <svg>
            <use href={item.favorite ? "#Star-Filled" : "#Star"} />
          </svg>
        </button>
      </div>
    </article>
  );
}
