import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "./db";
import { hashPassword } from "./password";

export const EMAIL_VERIFICATION_TOKEN_MINUTES = 60 * 24;
export const PASSWORD_RESET_TOKEN_MINUTES = 30;

const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, "Verification link is invalid"),
});

const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").transform((email) => email.toLowerCase()),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset link is invalid"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function createAuthToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getAuthTokenExpiry(minutes: number, now = new Date()) {
  return new Date(now.getTime() + minutes * 60 * 1000);
}

export function isAuthTokenExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime();
}

export function normaliseVerifyEmailInput(input: unknown) {
  const parsed = verifyEmailSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Verification link is invalid" };
  }

  return { ok: true as const, token: parsed.data.token };
}

export function normaliseRequestPasswordResetInput(input: unknown) {
  const parsed = requestPasswordResetSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  return { ok: true as const, email: parsed.data.email };
}

export function normaliseResetPasswordInput(input: unknown) {
  const parsed = resetPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Reset link is invalid" };
  }

  return { ok: true as const, token: parsed.data.token, password: parsed.data.password };
}

export async function createEmailVerificationToken(userId: string) {
  const token = createAuthToken();
  const expiresAt = getAuthTokenExpiry(EMAIL_VERIFICATION_TOKEN_MINUTES);

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
      usedAt: null,
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash: hashAuthToken(token),
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashAuthToken(token) },
  });

  if (!record || record.usedAt || isAuthTokenExpired(record.expiresAt)) {
    return { ok: false as const, error: "Verification link is invalid or expired" };
  }

  const verifiedAt = new Date();
  const user = await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: verifiedAt },
    });

    return tx.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: verifiedAt },
    });
  });

  return { ok: true as const, user };
}

export async function createPasswordResetTokenForEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: true as const, user: null, token: null };
  }

  const token = createAuthToken();
  const expiresAt = getAuthTokenExpiry(PASSWORD_RESET_TOKEN_MINUTES);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashAuthToken(token),
      userId: user.id,
      expiresAt,
    },
  });

  return { ok: true as const, user, token, expiresAt };
}

export async function resetPasswordWithToken(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashAuthToken(token) },
  });

  if (!record || record.usedAt || isAuthTokenExpired(record.expiresAt)) {
    return { ok: false as const, error: "Reset link is invalid or expired" };
  }

  const passwordHash = await hashPassword(password);
  const usedAt = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt },
    }),
    prisma.session.deleteMany({
      where: { userId: record.userId },
    }),
  ]);

  return { ok: true as const };
}
