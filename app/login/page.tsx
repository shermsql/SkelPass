"use client";

import { Suspense, useState } from "react";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import AuthLayout from "@/components/AuthLayout/AuthLayout";
import PasswordField from "@/components/PasswordField/PasswordField";

import formStyles from "@/components/AuthLayout/AuthForm.module.css";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred while signing in.");
        setLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome Back"
      title="Sign In to SkelPass."
      intro="Access your vault and keep your credentials close by."
    >
      <form className={formStyles.form} onSubmit={handleSubmit} autoComplete="on">
        <div className={formStyles.field}>
          <label className={formStyles.fieldLabel} htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
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

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter Your Password"
          required
          value={password}
          onChange={setPassword}
        />

        <div className={formStyles.formRow}>
          <label className={formStyles.checkboxLabel}>
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Remember Me</span>
          </label>
        </div>

        {error && <div className={formStyles.errorBanner}>{error}</div>}

        <button type="submit" className={formStyles.submit} disabled={loading}>
          {loading ? "Signing In…" : "Log In"}
          <svg>
            <use href="#Icon-Arrow" />
          </svg>
        </button>

        <p className={formStyles.switchAuth}>
          Don&#39;t have an account? <Link href="/register">Create One</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
