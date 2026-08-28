"use client";

import { useState } from "react";
import Link from "next/link";

import styles from "./Nav.module.css";

const links = [
  { href: "#Product", label: "Product" },
  { href: "#Features", label: "Features" },
  { href: "#Security", label: "Security" },
  { href: "#Support", label: "Support" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={`${styles.nav} container`} aria-label="Primary Navigation">
        <Link href="/#Top" className={styles.brand} aria-label="SkelPass Home">
          <svg className={styles.brandMark} aria-hidden="true">
            <use href="#Icon-Logo" />
          </svg>
          SkelPass
        </Link>

        <div className={styles.navCenter}>
          {links.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </div>

        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLogin}>
            Log in
          </Link>
          <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
            Start for free
          </Link>
        </div>

        <button
          type="button"
          className={`${styles.menuToggle} ${open ? styles.menuToggleOpen : ""}`}
          aria-label={open ? "Close Menu" : "Open Menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
        </button>
      </nav>

      <div className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}>
        <div className={styles.mobileMenuLinks}>
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.mobileMenuLink}
              onClick={() => setOpen(false)}
            >
              <span>{link.label}</span>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </a>
          ))}
        </div>
        <div className={styles.mobileMenuActions}>
          <Link href="/login" className={`${styles.btn} ${styles.btnSecondary}`}>
            Log in
          </Link>
          <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
            Start for free
          </Link>
        </div>
      </div>
    </header>
  );
}
