import Link from "next/link";

import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerMain}>
          <div className={styles.brandBlock}>
            <Link href="/#Top" className={styles.footerBrand}>
              <svg className={styles.footerBrandMark} aria-hidden="true">
                <use href="#Icon-Logo" />
              </svg>
              SkelPass
            </Link>
            <div className={styles.tagline}>
              Your digital life, <em>kept together.</em>
            </div>
            <p className={styles.description}>
              A calmer place for your passwords, credentials and accounts.
            </p>
          </div>

          <div>
            <div className={styles.columnTitle}>Explore</div>
            <div className={styles.links}>
              <a href="#Product" className={styles.link}>Product</a>
              <a href="#Features" className={styles.link}>Features</a>
              <a href="#Security" className={styles.link}>Security</a>
              <a href="#Download" className={styles.link}>Download</a>
              <a href="#Sponsor" className={styles.link}>Sponsor</a>
              <a href="#Support" className={styles.link}>Support</a>
            </div>
          </div>

          <div>
            <div className={styles.columnTitle}>Connect</div>
            <div className={styles.links}>
              <a href="https://github.com/Skelvric" className={styles.link} target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://linkedin.com/company/Skelvric" className={styles.link} target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="mailto:support@skelvric.com" className={styles.link}>Email</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copyright}>
            <span>© {year} SkelPass</span>
            <span className={styles.separator}>/</span>
            <span>Built for a calmer, less complicated web.</span>
          </div>
          <a href="#Top" className={styles.backTop}>
            <svg width="14" height="14">
              <use href="#Icon-Up" />
            </svg>
            Back to Top
          </a>
        </div>
      </div>
    </footer>
  );
}
