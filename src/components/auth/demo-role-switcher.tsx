"use client";

import { Shield, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const demoUsers = [
  { email: "renter@leasemate.dev", label: "Renter" },
  { email: "owner@leasemate.dev", label: "Owner" },
  { email: "admin@leasemate.dev", label: "Admin" },
];

export function DemoRoleSwitcher({ currentEmail }: { currentEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(currentEmail ?? demoUsers[0].email);

  async function switchRole(nextEmail: string) {
    setEmail(nextEmail);
    await fetch("/api/demo-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: nextEmail }),
    });
    router.refresh();
  }

  return (
    <label className="role-switcher">
      <Shield size={16} />
      <span>Demo role</span>
      <select value={email} onChange={(event) => switchRole(event.target.value)}>
        {demoUsers.map((user) => (
          <option key={user.email} value={user.email}>
            {user.label}
          </option>
        ))}
      </select>
      <UserRound size={16} />
    </label>
  );
}
