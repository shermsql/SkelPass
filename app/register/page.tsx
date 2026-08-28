"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import AuthLayout from "@/components/AuthLayout/AuthLayout";
import PasswordField from "@/components/PasswordField/PasswordField";

import formStyles from "@/components/AuthLayout/AuthForm.module.css";

const STRENGTH_LABELS = [
  "Use at least 12 characters.",
  "A bit short.",
  "Getting stronger.",
  "Strong password.",
  "Excellent password.",
];

function scorePassword(value: string): number {
  let score = 0;
  if (value.length >= 12) score++;
  if (value.length >= 16) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => scorePassword(password), [password]);
  const passwordsMismatch =
    confirmPassword.length > 0 && confirmPassword !== password;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError("Your master password must be at least 12 characters long.");
      return;
    }
    if (passwordsMismatch) {
      setError("Passwords do not match.");
      return;
    }
    if (!acknowledged) {
      setError("Please acknowledge the master password notice to continue.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred while creating your account.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Get Started"
      title="Create Your Vault."
      intro="Create a free SkelPass account and give your passwords a place to live."
    >
      <form className={formStyles.form} onSubmit={handleSubmit} autoComplete="on">
        <div className={formStyles.field}>
          <label className={formStyles.fieldLabel} htmlFor="name">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your Name"
            required
            className={formStyles.textInput}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.fieldLabel} htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            required
            className={formStyles.textInput}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={formStyles.field}>
          <PasswordField
            id="password"
            name="password"
            label="Master Password"
            autoComplete="new-password"
            placeholder="Create Strong Password"
            minLength={12}
            required
            value={password}
            onChange={setPassword}
          />

          <div className={formStyles.strength}>
            <div className={formStyles.strengthBars}>
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={index < score ? formStyles.strengthBarActive : ""}
                />
              ))}
            </div>
            <div className={formStyles.strengthLabel}>
              {STRENGTH_LABELS[password.length === 0 ? 0 : score]}
            </div>
          </div>
        </div>

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Master Password"
          autoComplete="new-password"
          placeholder="Re-Enter Your Password"
          minLength={12}
          required
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        {passwordsMismatch && (
          <p style={{ marginTop: -10, marginBottom: 14, fontSize: 10, color: "#e8a4a4" }}>
            Passwords do not match.
          </p>
        )}

        <label className={formStyles.terms}>
          <input
            type="checkbox"
            name="masterPasswordAcknowledgement"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
            required
          />
          <span>
            I understand that my master password is important and should
            never be shared with anyone.
          </span>
        </label>

        {error && <div className={formStyles.errorBanner}>{error}</div>}

        <button type="submit" className={formStyles.submit} disabled={loading}>
          {loading ? "Creating Account…" : "Create Account"}
          <svg>
            <use href="#Icon-Arrow" />
          </svg>
        </button>

        <p className={formStyles.switchAuth}>
          Already have an account? <Link href="/login">Log In</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
