"use client";

import { Apple, ArrowRight, Chrome, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type AccountType = "RENTER" | "OWNER";

export function SignupForm() {
  const [accountType, setAccountType] = useState<AccountType>("RENTER");
  const [message, setMessage] = useState("");

  function submitSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Account creation is ready for backend wiring. Please use the seeded sign-in accounts for this MVP.");
  }

  return (
    <form className="form-grid elevated-auth-form" onSubmit={submitSignup}>
      <div className="auth-segmented" role="tablist" aria-label="Account type">
        <button
          type="button"
          className={accountType === "RENTER" ? "active" : ""}
          onClick={() => setAccountType("RENTER")}
          aria-pressed={accountType === "RENTER"}
        >
          Renter
        </button>
        <button
          type="button"
          className={accountType === "OWNER" ? "active" : ""}
          onClick={() => setAccountType("OWNER")}
          aria-pressed={accountType === "OWNER"}
        >
          Property owner
        </button>
      </div>

      <div className="form-field">
        <label htmlFor="signup-name">Full name</label>
        <input id="signup-name" name="name" autoComplete="name" placeholder="e.g. Sarah Jenkins" required />
      </div>
      <div className="form-field">
        <label htmlFor="signup-email">Email address</label>
        <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="sarah@example.com.au" required />
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
            required
          />
          <Eye size={17} aria-hidden="true" />
        </div>
      </div>

      <label className="auth-checkbox">
        <input type="checkbox" name="terms" required />
        <span>
          I agree to the <Link href="/signup">Terms of Service</Link> and{" "}
          <Link href="/signup">Privacy Policy</Link>, including Victorian lease transfer guidance.
        </span>
      </label>

      <button className="primary-button" type="submit">
        Create account
        <ArrowRight size={17} />
      </button>

      <div className="auth-divider">
        <span>or register with</span>
      </div>

      <div className="auth-provider-grid">
        <button className="secondary-button auth-provider-button" type="button">
          <Chrome size={17} />
          Google
        </button>
        <button className="secondary-button auth-provider-button" type="button">
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
