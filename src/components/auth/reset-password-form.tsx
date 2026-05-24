"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [message, setMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function submitReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsPending(false);
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const result = await response.json();

    setIsPending(false);
    setMessage(result.message ?? result.error ?? "Could not update your password.");
    setIsComplete(response.ok && result.ok);
  }

  return (
    <form className="form-grid elevated-auth-form" onSubmit={submitReset}>
      <div className="form-field">
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          disabled={isPending || isComplete}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          disabled={isPending || isComplete}
          required
        />
      </div>
      <button className="primary-button" type="submit" disabled={isPending || isComplete} aria-busy={isPending}>
        {isPending ? <span className="button-spinner" aria-hidden="true" /> : <LockKeyhole size={18} />}
        {isPending ? "Updating password" : "Update password"}
        {!isPending ? <ArrowRight size={17} /> : null}
      </button>
      {isComplete ? (
        <Link className="secondary-button" href="/login">
          Continue to sign in
        </Link>
      ) : null}
      {message ? <div className={isComplete ? "notice success" : "notice danger"}>{message}</div> : null}
    </form>
  );
}
