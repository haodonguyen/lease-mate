import { z } from "zod";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./password";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80, "Name must be 80 characters or fewer"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current one",
  });

function firstError(error: z.ZodError) {
  const issue = error.issues[0];
  const field = typeof issue?.path[0] === "string" ? issue.path[0] : "form";
  return { [field]: issue?.message ?? "Invalid input" };
}

export async function updateAccountProfile(userId: string, input: unknown) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: firstError(parsed.error) };
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name },
    select: { id: true, name: true, email: true, role: true },
  });

  return { ok: true as const, user };
}

export async function changeAccountPassword(userId: string, input: unknown) {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: firstError(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { ok: false as const, errors: { currentPassword: "Password sign-in is not enabled for this account" } };
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false as const, errors: { currentPassword: "Current password is incorrect" } };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { ok: true as const };
}
