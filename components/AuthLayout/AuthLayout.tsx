import Link from "next/link";

import styles from "./AuthLayout.module.css";

export default function AuthLayout({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="SkelPass Home">
          <span className={styles.brandIcon}>
            <svg>
              <use href="#Icon-Logo" />
            </svg>
          </span>
          SkelPass
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          {children}
        </div>
      </main>

      <footer className={styles.footer}>
        © {year} SkelPass · Password management, simplified.
      </footer>
    </div>
  );
}
