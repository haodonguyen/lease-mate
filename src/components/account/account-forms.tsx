"use client";

import { KeyRound, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Notice = { tone: "success" | "error"; message: string } | null;

export function ProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setNotice(null);

    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile", name }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice({ tone: "error", message: data?.errors?.name ?? "Could not update your profile." });
        return;
      }

      setNotice({ tone: "success", message: "Profile updated." });
      router.refresh();
    } catch {
      setNotice({ tone: "error", message: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <div className="form-field">
        <label htmlFor="account-name">Display name</label>
        <input
          id="account-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={80}
          required
        />
      </div>
      <button className="primary-button" type="submit" disabled={pending}>
        <Save size={17} />
        {pending ? "Saving…" : "Save changes"}
      </button>
      {notice ? <div className="notice">{notice.message}</div> : null}
    </form>
  );
}

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setNotice(null);

    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setNotice({
          tone: "error",
          message: data?.errors?.currentPassword ?? data?.errors?.newPassword ?? "Could not change your password.",
        });
        return;
      }

      setNotice({ tone: "success", message: "Password changed." });
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setNotice({ tone: "error", message: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <div className="form-field">
        <label htmlFor="current-password">Current password</label>
        <input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <button className="primary-button" type="submit" disabled={pending}>
        <KeyRound size={17} />
        {pending ? "Updating…" : "Change password"}
      </button>
      {notice ? <div className="notice">{notice.message}</div> : null}
    </form>
  );
}
