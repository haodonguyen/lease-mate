"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormProps {
  defaultEmail?: string;
  defaultPassword?: string;
}

export function LoginForm({ defaultEmail = "", defaultPassword = "" }: LoginFormProps) {
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

    router.push(result.user.role === "RENTER" ? "/saved" : "/dashboard");
    router.refresh();
  }

  return (
    <form className="form-grid" onSubmit={submitLogin}>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue={defaultPassword}
          required
        />
      </div>
      <button className="primary-button" type="submit" disabled={isPending}>
        <LogIn size={18} />
        {isPending ? "Signing in" : "Sign in"}
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </form>
  );
}
