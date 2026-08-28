import Link from "next/link";

import Nav from "@/components/Nav/Nav";
import Footer from "@/components/Footer/Footer";

import styles from "./page.module.css";

const features = [
  {
    icon: "Icon-Lock",
    title: "End-to-end encryption",
    text: "Every password in your vault is encrypted server-side before it's stored.",
  },
  {
    icon: "Icon-Folder",
    title: "Organized with folders",
    text: "Group your accounts into folders like Work, Personal, Development and Finance.",
  },
  {
    icon: "Icon-Key",
    title: "Strong password generator",
    text: "Create cryptographically secure, unique passwords with a single click.",
  },
  {
    icon: "Icon-Shield",
    title: "Vault health",
    text: "Instantly see weak passwords or accounts that need updating.",
  },
  {
    icon: "Icon-Globe",
    title: "Access from anywhere",
    text: "Sign in to your vault safely from your browser.",
  },
  {
    icon: "Icon-Check",
    title: "Simple and calm",
    text: "No unnecessary complexity — just a clean interface that does its job.",
  },
];

export default function LandingPage() {
  return (
    <>
      <div id="Top" />
      <Nav />

      <main>
        <section className={styles.hero}>
          <div className={`container ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                Password management, simplified.
              </div>

              <h1>
                Your digital life,
                <br />
                <em>kept together.</em>
              </h1>

              <p className={styles.heroDescription}>
                A calmer place for all the passwords, credentials and
                accounts you&#39;ve picked up along the way.
              </p>

              <div className={styles.heroActions}>
                <Link href="/register" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                  Start for free
                  <svg className={styles.icon}>
                    <use href="#Icon-Arrow" />
                  </svg>
                </Link>
                <a href="#Product" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}>
                  Explore SkelPass
                </a>
              </div>

              <p className={styles.heroNote}>
                <span>●</span>
                Free to use. Built to help you stay calm.
              </p>
            </div>

            <div className={styles.vaultWindow}>
              <div className={styles.vaultTopbar}>
                <div className={styles.windowDots}>
                  <span />
                  <span />
                  <span />
                </div>
                <span className={styles.vaultTitle}>SkelPass Desktop</span>
                <span style={{ width: 24, height: 24 }} />
              </div>

              <div className={styles.vaultBody}>
                <aside className={styles.vaultSidebar}>
                  <div className={styles.sidebarLabel}>Vault</div>
                  <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
                    <svg className={styles.sidebarIcon}>
                      <use href="#Icon-Key" />
                    </svg>
                    Passwords
                  </div>
                  <div className={styles.sidebarItem}>
                    <svg className={styles.sidebarIcon}>
                      <use href="#Icon-Folder" />
                    </svg>
                    Folders
                  </div>
                  <div className={styles.sidebarItem}>
                    <svg className={styles.sidebarIcon}>
                      <use href="#Icon-Shield" />
                    </svg>
                    Security
                  </div>
                </aside>

                <div className={styles.vaultContent}>
                  <div className={styles.vaultContentTop}>
                    <span className={styles.vaultContentTitle}>All credentials</span>
                    <button className={styles.addButtonMini} type="button" aria-label="Add Credential">
                      <svg width="13" height="13">
                        <use href="#Icon-Plus" />
                      </svg>
                    </button>
                  </div>

                  {[
                    { i: "G", n: "GitHub", m: "github.com" },
                    { i: "A", n: "Apple", m: "apple.com" },
                    { i: "S", n: "Stripe", m: "stripe.com" },
                    { i: "D", n: "Discord", m: "discord.com" },
                  ].map((c) => (
                    <div className={styles.credential} key={c.n}>
                      <div className={styles.credentialIcon}>{c.i}</div>
                      <div className={styles.credentialInfo}>
                        <div className={styles.credentialName}>{c.n}</div>
                        <div className={styles.credentialMeta}>{c.m}</div>
                      </div>
                      <span className={styles.credentialStatus} title="Secure" />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.vaultFooter}>
                <span>4 credentials</span>
                <span>Vault protected</span>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionBorder}`} id="Product">
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.eyebrowSmall}>Product</div>
              <h2 className={styles.sectionTitle}>
                One vault, <em>for all your accounts.</em>
              </h2>
              <p className={styles.sectionIntro}>
                SkelPass puts your passwords, notes and account details in
                front of you the moment you need them — no digging required.
              </p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionBorder}`} id="Features">
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.eyebrowSmall}>Features</div>
              <h2 className={styles.sectionTitle}>
                Simple on the surface, <em>serious about security.</em>
              </h2>
            </div>

            <div className={styles.featureGrid}>
              {features.map((f) => (
                <div className={styles.featureCard} key={f.title}>
                  <svg className={styles.featureIcon}>
                    <use href={`#${f.icon}`} />
                  </svg>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionBorder}`} id="Security">
          <div className="container">
            <div className={styles.securityGrid}>
              <div>
                <div className={styles.eyebrowSmall}>Security</div>
                <h2 className={styles.sectionTitle}>
                  Your passwords, <em>nobody&#39;s business but yours.</em>
                </h2>
                <p className={styles.sectionIntro}>
                  Every password in your vault is encrypted server-side with
                  AES-256-GCM, and your session is protected with JWT-based,
                  HttpOnly cookies. Your master password is never stored in
                  plain text — it&#39;s hashed with bcrypt.
                </p>
              </div>
              <ul className={styles.securityList}>
                <li>
                  <svg><use href="#Icon-Check" /></svg>
                  Field-level encryption with AES-256-GCM
                </li>
                <li>
                  <svg><use href="#Icon-Check" /></svg>
                  Master password hashing with bcrypt
                </li>
                <li>
                  <svg><use href="#Icon-Check" /></svg>
                  Session management with HttpOnly, SameSite cookies
                </li>
                <li>
                  <svg><use href="#Icon-Check" /></svg>
                  Every user can only access their own vault
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionBorder}`} id="Support">
          <div className="container">
            <div className={styles.sectionHead}>
              <div className={styles.eyebrowSmall}>Support</div>
              <h2 className={styles.sectionTitle}>
                Have questions? <em>We&#39;re here.</em>
              </h2>
              <p className={styles.sectionIntro}>
                If you have any questions, feel free to reach us at{" "}
                <a href="mailto:support@skelvric.com" className={styles.inlineLink}>
                  support@skelvric.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className="container">
            <div className={styles.ctaInner}>
              <div className={styles.ctaLabel}>Start with a cleaner vault.</div>
              <h2>
                Keep your digital life <em>together.</em>
              </h2>
              <p>
                Create your free SkelPass account and give your credentials
                a calmer home.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/register" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                  Start for free
                  <svg className={styles.icon}>
                    <use href="#Icon-Arrow" />
                  </svg>
                </Link>
                <Link href="/login" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}>
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
