"use client";

import { Apple, ArrowRight, Chrome, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        acceptedTerms: formData.get("terms") === "on",
      }),
    });
    const result = await response.json();
    setIsPending(false);

    if (!response.ok || !result.ok) {
      setMessage(result.error ?? "Could not create your account.");
      return;
    }

    const email = encodeURIComponent(String(formData.get("email") ?? ""));
    router.push(`/verify-email?sent=1&email=${email}`);
    router.refresh();
  }

  return (
    <form className="form-grid elevated-auth-form" onSubmit={submitSignup}>
      <div className="form-field">
        <label htmlFor="signup-name">Full name</label>
        <input id="signup-name" name="name" autoComplete="name" placeholder="e.g. Sarah Jenkins" disabled={isPending} required />
      </div>
      <div className="form-field">
        <label htmlFor="signup-email">Email address</label>
        <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="sarah@example.com.au" disabled={isPending} required />
      </div>
      <div className="form-field">
        <label htmlFor="signup-password">Password</label>
        <div className="password-field">
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            minLength={8}
            disabled={isPending}
            required
          />
          <Eye size={17} aria-hidden="true" />
        </div>
      </div>

      <label className="auth-checkbox">
        <input type="checkbox" name="terms" disabled={isPending} required />
        <span>
          I agree to the <Link href="/signup">Terms of Service</Link> and{" "}
          <Link href="/signup">Privacy Policy</Link>, including Australian lease transfer guidance.
        </span>
      </label>

      <button className="primary-button" type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? <span className="button-spinner" aria-hidden="true" /> : null}
        {isPending ? "Creating account" : "Create account"}
        {!isPending ? <ArrowRight size={17} /> : null}
      </button>

      <div className="auth-divider">
        <span>or register with</span>
      </div>

      <div className="auth-provider-grid">
        <button className="secondary-button auth-provider-button" type="button" disabled={isPending}>
          <Chrome size={17} />
          Google
        </button>
        <button className="secondary-button auth-provider-button" type="button" disabled={isPending}>
          <Apple size={17} />
          Apple
        </button>
      </div>

      <p className="auth-switch-copy">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
      {message ? <div className="notice">{message}</div> : null}
    </form>
  );
}
