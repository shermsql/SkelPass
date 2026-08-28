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
          <div className={styles.itemName}>{item.service}</div>
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
