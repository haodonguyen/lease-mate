import type { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "./db";

export const demoUsers = [
  { email: "renter@leasemate.dev", name: "Riley Nguyen", role: "RENTER" as const },
  { email: "owner@leasemate.dev", name: "Mia Tran", role: "OWNER" as const },
  { email: "admin@leasemate.dev", name: "Alex Morgan", role: "ADMIN" as const },
];

export async function getCurrentUser() {
  const store = await cookies();
  const email = store.get("leasemate_user")?.value ?? demoUsers[0].email;
  return prisma.user.findUnique({ where: { email } });
}

export function isDemoAuthEnabled(environment = process.env.NODE_ENV) {
  return environment !== "production";
}

export async function setDemoUser(email: string) {
  if (!isDemoAuthEnabled()) {
    return null;
  }

  const user = demoUsers.find((candidate) => candidate.email === email);
  if (!user) {
    return null;
  }

  const store = await cookies();
  store.set("leasemate_user", user.email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return user;
}

export function canManageListings(role: UserRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canModerate(role: UserRole) {
  return role === "ADMIN";
}
