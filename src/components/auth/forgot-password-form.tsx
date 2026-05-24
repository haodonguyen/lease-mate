"use client";

import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email") }),
    });
    const result = await response.json();

    setIsPending(false);
    setMessage(result.message ?? result.error ?? "Could not request a password reset.");
    setIsError(!response.ok || !result.ok);
  }

  return (
    <form className="form-grid elevated-auth-form" onSubmit={submitRequest}>
      <div className="form-field">
        <label htmlFor="reset-email">Email address</label>
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="alex@example.com.au"
          disabled={isPending}
          required
        />
      </div>
      <button className="primary-button" type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? <span className="button-spinner" aria-hidden="true" /> : <Mail size={18} />}
        {isPending ? "Sending link" : "Send reset link"}
        {!isPending ? <ArrowRight size={17} /> : null}
      </button>
      <p className="auth-switch-copy">
        Remembered it? <Link href="/login">Sign in</Link>
      </p>
      {message ? <div className={isError ? "notice danger" : "notice success"}>{message}</div> : null}
    </form>
  );
}
