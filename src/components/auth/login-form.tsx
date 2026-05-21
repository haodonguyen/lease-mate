"use client";

import { ArrowRight, Chrome, Eye, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormProps {
  defaultEmail?: string;
  defaultPassword?: string;
  redirectTo?: string;
}

export function LoginForm({ defaultEmail = "", defaultPassword = "", redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const result = await response.json();

    setIsPending(false);

    if (!response.ok || !result.ok) {
      setMessage("Invalid email or password.");
      return;
    }

    router.push(redirectTo ?? (result.user.role === "RENTER" ? "/saved" : "/dashboard"));
    router.refresh();
  }

  return (
    <form className="form-grid elevated-auth-form" onSubmit={submitLogin}>
      <div className="form-field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder="e.g. alex@example.com.au"
          required
        />
      </div>
      <div className="form-field">
        <div className="label-row">
          <label htmlFor="password">Password</label>
          <Link href="/signup">Forgot password?</Link>
        </div>
        <div className="password-field">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue={defaultPassword}
            required
          />
          <Eye size={17} aria-hidden="true" />
        </div>
      </div>
      <label className="auth-checkbox">
        <input type="checkbox" name="remember" />
        <span>Remember me for 30 days</span>
      </label>
      <button className="primary-button" type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? <span className="button-spinner" aria-hidden="true" /> : <LogIn size={18} />}
        {isPending ? "Signing in" : "Sign in"}
        {!isPending ? <ArrowRight size={17} /> : null}
      </button>
      <div className="auth-divider">
        <span>or</span>
      </div>
      <button className="secondary-button auth-provider-button" type="button">
        <Chrome size={17} />
        Continue with Google
      </button>
      <p className="auth-switch-copy">
        Don&apos;t have an account? <Link href="/signup">Join LeaseMate</Link>
      </p>
      {message ? <div className="notice">{message}</div> : null}
    </form>
  );
}
