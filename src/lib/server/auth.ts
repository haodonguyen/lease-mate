import { Prisma, type UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./password";
import {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
  isSessionExpired,
  SESSION_COOKIE_NAME,
} from "./session";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80, "Name must be 80 characters or fewer"),
  email: z.string().trim().email("Enter a valid email address").transform((email) => email.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["RENTER", "OWNER"], {
    errorMap: () => ({ message: "Choose renter or property owner" }),
  }),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "Accept the terms to create an account" }),
  }),
});

export type LoginInput = z.output<typeof loginSchema>;
export type SignupInput = z.output<typeof signupSchema>;

export async function getCurrentUser() {
  return getCurrentAuthenticatedUser();
}

export async function getCurrentAuthenticatedUser() {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    const user = await getUserForSessionToken(sessionToken);
    if (user) {
      return user;
    }
  }

  return null;
}

export function isValidLoginInput(input: unknown) {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  return { ok: true as const, data: parsed.data };
}

export function isValidSignupInput(input: unknown) {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Signup details are invalid",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  return { ok: true as const, data: parsed.data };
}

export async function verifyLoginCredentials(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    return null;
  }

  const verified = await verifyPassword(input.password, user.passwordHash);
  return verified ? user : null;
}

export async function createSignupUser(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return { ok: false as const, error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
  }).catch((error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }

    throw error;
  });

  if (!user) {
    return { ok: false as const, error: "An account with this email already exists" };
  }

  return { ok: true as const, user };
}

export async function createUserSession(userId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiry();

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function clearCurrentSession() {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(sessionToken) },
    });
  }

  store.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

async function getUserForSessionToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (isSessionExpired(session.expiresAt)) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export function canManageListings(role: UserRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canModerate(role: UserRole) {
  return role === "ADMIN";
}
