"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className = "secondary-button" }: { className?: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    setIsPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button className={className} type="button" onClick={logout} disabled={isPending}>
      <LogOut size={18} />
      {isPending ? "Signing out" : "Sign out"}
    </button>
  );
}
