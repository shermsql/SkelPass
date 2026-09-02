"use client";

import { useEffect, useState } from "react";

import type { FolderDto, VaultItemDetailDto } from "@/lib/types";

import Select from "@/components/Select/Select";

import styles from "./VaultModal.module.css";

const UNCATEGORIZED = "__uncategorized__";

interface VaultModalProps {
  open: boolean;
  item: VaultItemDetailDto | null;
  folders: FolderDto[];
  initialPassword?: string | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

const EMPTY_FORM = {
  service: "",
  website: "",
  username: "",
  password: "",
  note: "",
  folder: UNCATEGORIZED,
};

export default function VaultModal({
  open,
  item,
  folders,
  initialPassword,
  onClose,
  onSaved,
  onDeleted,
}: VaultModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        service: item.service,
        website: item.website ?? "",
        username: item.username ?? "",
        password: item.password,
        note: item.note ?? "",
        folder: item.folder ?? UNCATEGORIZED,
      });
    } else {
      setForm({ ...EMPTY_FORM, password: initialPassword ?? "" });
    }
    setError(null);
    setCopied(false);
    setPasswordVisible(!item);
  }, [open, item, initialPassword]);

  if (!open) return null;

  async function handleGenerate() {
    try {
      const response = await fetch("/api/vault/generate?length=24");
      const data = await response.json();
      if (response.ok) {
        setForm((f) => ({ ...f, password: data.password }));
        setPasswordVisible(true);
      }
    } catch { }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(form.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.service.trim() || !form.password) {
      setError("Service name and password are required.");
      return;
    }

    setSaving(true);
    try {
      const endpoint = item ? `/api/vault/${item.id}` : "/api/vault";
      const method = item ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          folder: form.folder === UNCATEGORIZED ? "" : form.folder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred while saving.");
        return;
      }

      onSaved();
    } catch (err) {
      console.error("Vault save failed:", err);
      setError("Could not connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/vault/${item.id}`, { method: "DELETE" });
      if (response.ok) {
        onDeleted();
      } else {
        const data = await response.json();
        setError(data.error || "An Error Occurred While Deleting The Entry.");
        setDeleting(false);
      }
    } catch {
      setError("Could Not Connect To The Server. Please Try Again.");
      setDeleting(false);
    }
  }

  return (
    <div
      className={`${styles.overlay} ${styles.overlayActive}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          <h2>{item ? "Edit Password" : "Add Password"}</h2>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
            <svg>
              <use href="#Close" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.field}>
              <label>Name</label>
              <input
                placeholder="Service Name"
                required
                value={form.service}
                onChange={(event) => setForm((f) => ({ ...f, service: event.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label>Website</label>
              <input
                type="url"
                placeholder="https://pass.skelvric.com"
                value={form.website}
                onChange={(event) => setForm((f) => ({ ...f, website: event.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label>Username or Email</label>
              <input
                placeholder="support@skelvric.com"
                value={form.username}
                onChange={(event) => setForm((f) => ({ ...f, username: event.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.passwordWrap}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter A Password"
                  required
                  value={form.password}
                  onChange={(event) => setForm((f) => ({ ...f, password: event.target.value }))}
                />
                <button
                  type="button"
                  className={styles.inlineAction}
                  onClick={() => setPasswordVisible((v) => !v)}
                  aria-label={passwordVisible ? "Hide Password" : "Show Password"}
                  title={passwordVisible ? "Hide Password" : "Show Password"}
                >
                  <svg>
                    <use href={passwordVisible ? "#Icon-Eye-Off" : "#Icon-Eye"} />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.inlineActionSecond}
                  onClick={handleCopy}
                  aria-label="Copy Password"
                  title={copied ? "Copied" : "Copy"}
                >
                  <svg>
                    <use href="#Copy" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.generate}
                  onClick={handleGenerate}
                  aria-label="Generate Password"
                  title="Generate A Secure Password"
                >
                  <svg>
                    <use href="#Wand" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label>Note</label>
              <textarea
                className={styles.textarea}
                placeholder="Add A Note (Recovery Codes, Security Questions)"
                rows={3}
                value={form.note}
                onChange={(event) => setForm((f) => ({ ...f, note: event.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label>Folder</label>
              <Select
                id="vault-folder-select"
                options={[
                  { value: UNCATEGORIZED, label: "Uncategorized" },
                  ...folders.map((folder) => ({ value: folder.name, label: folder.name })),
                ]}
                value={form.folder}
                onChange={(value) => setForm((f) => ({ ...f, folder: value }))}
              />
              {folders.length === 0 && (
                <p className={styles.hint}>
                  You can create folders from the sidebar to organize your vault.
                </p>
              )}
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </div>

          <div className={styles.modalFooter}>
            {item && (
              <button
                type="button"
                className={`${styles.modalButton} ${styles.modalButtonDanger}`}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
            <button type="button" className={styles.modalButton} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
