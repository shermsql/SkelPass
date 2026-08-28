"use client";

import Link from "next/link";

import { useDashboard } from "@/app/dashboard/DashboardContext";

import styles from "./Topbar.module.css";

export default function Topbar() {
  const { search, setSearch, setSidebarOpen } = useDashboard();

  return (
    <header className={styles.topbar}>
      <button
        className={styles.mobileMenu}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Menu"
      >
        <svg>
          <use href="#Menu" />
        </svg>
      </button>

      <Link href="/" className={styles.mobileLogo}>
        <svg>
          <use href="#Icon-Logo" />
        </svg>
        <span>SkelPass</span>
      </Link>

      <div className={styles.search}>
        <svg>
          <use href="#Search" />
        </svg>
        <input
          type="search"
          placeholder="Search Your Vault..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
    </header>
  );
}
