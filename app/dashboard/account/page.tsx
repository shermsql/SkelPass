"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import Image from "next/image";

import { useDashboard } from "../DashboardContext";

import styles from "./Account.module.css";

const MAX_AVATAR_DIMENSION = 256;

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = document.createElement("img");

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = MAX_AVATAR_DIMENSION;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas is not supported."));
        return;
      }

      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image."));
    };

    img.src = objectUrl;
  });
}

export default function AccountPage() {
  const { user, userLoading, setUser } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user?.id]);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }

    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarDataUrl: dataUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAvatarError(data.error || "Could not update your photo.");
      } else {
        setUser(data.user);
      }
    } catch {
      setAvatarError("Could not process the selected image.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarDataUrl: null }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAvatarError(data.error || "Could not remove your photo.");
      } else {
        setUser(data.user);
      }
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!name.trim() || !email.trim()) {
      setProfileError("Name and email cannot be empty.");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setProfileError(data.error || "Could not update your profile.");
      } else {
        setUser(data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 2500);
      }
    } catch {
      setProfileError("Could not connect to the server. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 12) {
      setPasswordError("Your new master password must be at least 12 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data.error || "Could not update your password.");
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 2500);
      }
    } catch {
      setPasswordError("Could not connect to the server. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  }

  const initials = user
    ? user.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SK";

  if (userLoading && !user) {
    return (
      <div className={styles.content}>
        <div className={styles.loading}>Loading your account…</div>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <Link href="/dashboard" className={styles.backLink}>
        <svg>
          <use href="#Chevron-Left" />
        </svg>
        Back to vault
      </Link>

      <div className={styles.heading}>
        <div className={styles.eyebrow}>Manage your account</div>
        <h1>
          Account <em>settings.</em>
        </h1>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.cardTitle}>Profile photo</div>
          <div className={styles.avatarRow}>
            <div className={styles.avatarLarge}>
              {user?.avatarDataUrl ? (
                <Image
                  src={user.avatarDataUrl}
                  alt=""
                  width={72}
                  height={72}
                  className={styles.avatarImage}
                  unoptimized
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className={styles.avatarActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                <svg>
                  <use href="#Camera" />
                </svg>
                {avatarUploading ? "Uploading…" : "Change Photo"}
              </button>
              {user?.avatarDataUrl && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={handleRemoveAvatar}
                  disabled={avatarUploading}
                >
                  Remove photo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          {avatarError && <div className={styles.error}>{avatarError}</div>}
          <p className={styles.hint}>JPEG or PNG. It&#39;s cropped and resized automatically.</p>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}>Profile details</div>
          <form onSubmit={handleProfileSubmit}>
            <div className={styles.field}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {profileError && <div className={styles.error}>{profileError}</div>}
            {profileSuccess && <div className={styles.success}>Profile updated.</div>}

            <button type="submit" className={styles.primaryButton} disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}>Change master password</div>
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.field}>
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirmNewPassword">Confirm new password</label>
              <input
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            {passwordError && <div className={styles.error}>{passwordError}</div>}
            {passwordSuccess && <div className={styles.success}>Password updated.</div>}

            <button type="submit" className={styles.primaryButton} disabled={savingPassword}>
              {savingPassword ? "Updating…" : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
