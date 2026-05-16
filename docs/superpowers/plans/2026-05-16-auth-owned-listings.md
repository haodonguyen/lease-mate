# Auth And Owned Listings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the production demo-role fallback with a simple portfolio-grade authentication flow and enforce user-owned listing boundaries across create, dashboard, and listing status actions.

**Architecture:** Keep the current Next.js App Router, Prisma, and server-service structure. Add password-based local authentication with signed HTTP-only session cookies, keep demo role switching only for development/test, and make server APIs depend on `getCurrentUser()` instead of trusting client state.

**Tech Stack:** Next.js App Router, TypeScript, Prisma/PostgreSQL, Vitest, Zod, Node `crypto`, HTTP-only cookies.

---

## File Structure

- Modify `prisma/schema.prisma`: add `passwordHash` and `emailVerifiedAt` to `User`, plus a `Session` model for persistent sessions.
- Create `prisma/migrations/20260516090000_add_sessions/migration.sql`: add session table and user auth columns.
- Modify `prisma/seed.mjs`: seed demo users with password hashes and clear sessions safely.
- Modify `src/lib/server/auth.ts`: add password hashing, credential verification, session creation, session lookup, logout, and role helpers.
- Create `src/lib/server/password.ts`: isolate password hashing/verification so tests do not need cookies.
- Create `src/lib/server/session.ts`: isolate signed session token creation and lookup.
- Create `src/app/login/page.tsx`: server-rendered login page.
- Create `src/components/auth/login-form.tsx`: client login form with loading/error states.
- Create `src/app/api/auth/login/route.ts`: login API endpoint.
- Create `src/app/api/auth/logout/route.ts`: logout API endpoint.
- Modify `src/app/layout.tsx`: show current user state and nav links consistently.
- Modify `src/components/auth/demo-role-switcher.tsx`: hide in production and label it as development-only.
- Modify `src/app/dashboard/page.tsx`: show login-required state instead of role-switch instruction in production.
- Modify `src/app/listings/new/page.tsx`: show login-required state and retain owner/admin-only checks.
- Modify `src/app/api/listings/status/route.ts`: enforce owner/admin rules with tests.
- Create `tests/password.test.ts`: hash and verify password behavior.
- Create `tests/session.test.ts`: session token signing and expiry behavior.
- Modify `tests/auth.test.ts`: current user lookup and production demo-auth guard.
- Modify `tests/listing-service.test.ts`: owner-only listing status behavior where service-level logic is testable.

---

### Task 1: Password Utilities

**Files:**
- Create: `src/lib/server/password.ts`
- Test: `tests/password.test.ts`

- [ ] **Step 1: Write the failing password tests**

```ts
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/server/password";

describe("password utilities", () => {
  it("hashes a password without storing the plain text", async () => {
    const hash = await hashPassword("LeaseMate123!");

    expect(hash).not.toBe("LeaseMate123!");
    expect(hash).toMatch(/^scrypt:/);
  });

  it("verifies matching passwords and rejects wrong passwords", async () => {
    const hash = await hashPassword("LeaseMate123!");

    await expect(verifyPassword("LeaseMate123!", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/password.test.ts`

Expected: FAIL because `src/lib/server/password.ts` does not exist.

- [ ] **Step 3: Implement password utilities**

```ts
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) {
    return false;
  }

  const [algorithm, salt, hash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const actual = Buffer.from(hash, "hex");
  const expected = (await scrypt(password, salt, actual.length)) as Buffer;

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/password.test.ts`

Expected: PASS with 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/password.ts tests/password.test.ts
git commit -m "Add password hashing utilities"
```

---

### Task 2: Session Data Model

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260516090000_add_sessions/migration.sql`
- Modify: `prisma/seed.mjs`

- [ ] **Step 1: Add failing schema expectation**

Run: `rg -n "model Session|passwordHash|emailVerifiedAt" prisma/schema.prisma`

Expected: no matching `Session`, `passwordHash`, or `emailVerifiedAt`.

- [ ] **Step 2: Modify `User` and add `Session`**

```prisma
model User {
  id              String          @id @default(cuid())
  name            String
  email           String          @unique
  passwordHash    String?
  emailVerifiedAt DateTime?
  role            UserRole        @default(RENTER)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  sessions        Session[]
  listings        Listing[]
  enquiries       Enquiry[]
  reports         Report[]
  savedListings   SavedListing[]
  notifications   Notification[]
  analyticsEvents AnalyticsEvent[]
}

model Session {
  id        String   @id @default(cuid())
  tokenHash String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}
```

- [ ] **Step 3: Generate migration from current schema**

Run: `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script --output prisma/migrations/20260516090000_add_sessions/migration.sql`

Expected: migration file creates `Session`, adds nullable user auth columns, and adds indexes.

- [ ] **Step 4: Validate Prisma schema**

Run: `npx prisma validate`

Expected: `The schema at prisma/schema.prisma is valid`.

- [ ] **Step 5: Update seed users**

Add `passwordHash` values by importing `hashPassword`, clear sessions before users, and assign demo password `LeaseMate123!` to the three demo users.

```js
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/server/password.ts";

// inside main(), before deleting users
await prisma.session.deleteMany();

// before creating users
const demoPasswordHash = await hashPassword("LeaseMate123!");

for (const user of users) {
  await prisma.user.create({ data: { ...user, passwordHash: demoPasswordHash, emailVerifiedAt: new Date() } });
}
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260516090000_add_sessions/migration.sql prisma/seed.mjs
git commit -m "Add user sessions schema"
```

---

### Task 3: Session Service

**Files:**
- Create: `src/lib/server/session.ts`
- Test: `tests/session.test.ts`

- [ ] **Step 1: Write failing session tests**

```ts
import { describe, expect, it } from "vitest";
import { createSessionToken, hashSessionToken, isSessionExpired } from "../src/lib/server/session";

describe("session service", () => {
  it("creates random raw tokens and stable token hashes", () => {
    const first = createSessionToken();
    const second = createSessionToken();

    expect(first).not.toBe(second);
    expect(hashSessionToken(first)).toBe(hashSessionToken(first));
    expect(hashSessionToken(first)).not.toBe(first);
  });

  it("detects expired sessions", () => {
    expect(isSessionExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isSessionExpired(new Date(Date.now() + 1000))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/session.test.ts`

Expected: FAIL because `src/lib/server/session.ts` does not exist.

- [ ] **Step 3: Implement pure session helpers**

```ts
import { createHash, randomBytes } from "crypto";

export const SESSION_COOKIE_NAME = "leasemate_session";
export const SESSION_DURATION_DAYS = 14;

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiry(now = new Date()) {
  return new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

export function isSessionExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/session.test.ts`

Expected: PASS with 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/session.ts tests/session.test.ts
git commit -m "Add session token helpers"
```

---

### Task 4: Auth Service And Login API

**Files:**
- Modify: `src/lib/server/auth.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Modify: `tests/auth.test.ts`

- [ ] **Step 1: Add failing auth tests**

```ts
import { describe, expect, it } from "vitest";
import { canManageListings, canModerate, isDemoAuthEnabled, isValidLoginInput } from "../src/lib/server/auth";

describe("auth rules", () => {
  it("validates login payload shape", () => {
    expect(isValidLoginInput({ email: "owner@leasemate.dev", password: "LeaseMate123!" }).ok).toBe(true);
    expect(isValidLoginInput({ email: "bad", password: "short" }).ok).toBe(false);
  });

  it("enforces role capabilities", () => {
    expect(canManageListings("OWNER")).toBe(true);
    expect(canManageListings("ADMIN")).toBe(true);
    expect(canManageListings("RENTER")).toBe(false);
    expect(canModerate("ADMIN")).toBe(true);
    expect(canModerate("OWNER")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/auth.test.ts`

Expected: FAIL because `isValidLoginInput` is not exported.

- [ ] **Step 3: Implement auth validation and session-backed login helpers**

Add a Zod login schema, `verifyLoginCredentials`, `createUserSession`, `clearCurrentSession`, and update `getCurrentUser()` to prefer `leasemate_session` in production while keeping `leasemate_user` demo fallback outside production.

- [ ] **Step 4: Add login route**

`POST /api/auth/login` accepts `{ email, password }`, verifies credentials, sets an HTTP-only `leasemate_session` cookie, and returns `{ ok: true, user: { id, name, email, role } }`.

- [ ] **Step 5: Add logout route**

`POST /api/auth/logout` deletes the session row when present, clears `leasemate_session`, and returns `{ ok: true }`.

- [ ] **Step 6: Run auth tests**

Run: `npm test -- tests/auth.test.ts tests/password.test.ts tests/session.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/server/auth.ts src/app/api/auth/login/route.ts src/app/api/auth/logout/route.ts tests/auth.test.ts
git commit -m "Add session authentication API"
```

---

### Task 5: Login UI And Navigation

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/auth/demo-role-switcher.tsx`

- [ ] **Step 1: Add login page**

Create a server page with the product heading and `<LoginForm />`. If a user is already authenticated, link back to `/dashboard`.

- [ ] **Step 2: Add login form**

The form submits to `/api/auth/login`, shows an inline error on `401`, disables the button while pending, and routes owners/admins to `/dashboard` and renters to `/saved`.

- [ ] **Step 3: Add app navigation**

Root layout should render a compact top nav with marketplace, saved, dashboard, create listing, and login/logout state. Avoid marketing-style hero treatment; keep it application-like.

- [ ] **Step 4: Restrict demo switcher in production UI**

Return `null` from `DemoRoleSwitcher` when `process.env.NODE_ENV === "production"` or when the server does not pass a `showDemoSwitcher` prop.

- [ ] **Step 5: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/login/page.tsx src/components/auth/login-form.tsx src/app/layout.tsx src/components/auth/demo-role-switcher.tsx
git commit -m "Add login UI"
```

---

### Task 6: Owned Listing Access And Dashboard Polish

**Files:**
- Modify: `src/lib/server/listing-service.ts`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/listings/new/page.tsx`
- Modify: `src/app/api/listings/status/route.ts`
- Test: `tests/listing-service.test.ts`

- [ ] **Step 1: Add failing ownership tests**

Add tests proving owner/admin can manage listings and renter cannot, using pure helper functions such as `canUpdateListingStatus(actor, listingOwnerId)`.

- [ ] **Step 2: Implement pure ownership helper**

```ts
export function canUpdateListingStatus(
  actor: { id: string; role: "RENTER" | "OWNER" | "ADMIN" },
  listingOwnerId: string,
) {
  return actor.role === "ADMIN" || (actor.role === "OWNER" && actor.id === listingOwnerId);
}
```

- [ ] **Step 3: Apply helper in status API**

Fetch the listing by `listingId`, return `404` if missing, return `403` if `canUpdateListingStatus(user, listing.ownerId)` is false, then update status.

- [ ] **Step 4: Improve dashboard empty states**

For unauthenticated users show a login CTA. For renters show saved-listings CTA. For owners show listing cards and enquiry summaries.

- [ ] **Step 5: Run targeted tests**

Run: `npm test -- tests/listing-service.test.ts tests/auth.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/server/listing-service.ts src/app/dashboard/page.tsx src/app/listings/new/page.tsx src/app/api/listings/status/route.ts tests/listing-service.test.ts
git commit -m "Enforce owned listing access"
```

---

### Task 7: Final Verification And Deployment

**Files:**
- Verify only unless a previous task requires a fix.

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: no lint errors.

- [ ] **Step 3: Validate Prisma**

Run: `npx prisma validate`

Expected: schema is valid.

- [ ] **Step 4: Deploy to Vercel**

Run: `vercel deploy --prod`

Expected: build completes; `prisma migrate deploy` reports either the new session migration applied or no pending migrations.

- [ ] **Step 5: Verify live routes**

Run:

```bash
curl -I https://lease-mate-three.vercel.app/
curl -I https://lease-mate-three.vercel.app/login
curl -I https://lease-mate-three.vercel.app/dashboard
```

Expected: HTTP 200 for `/` and `/login`; dashboard should be HTTP 200 with login-required state when unauthenticated.

- [ ] **Step 6: Push**

```bash
git push origin main
```

---

## Self-Review

- Spec coverage: the plan covers real auth, session cookies, role-based dashboard access, owned listing status updates, migrations, seed data, tests, and deployment.
- Placeholder scan: no placeholder markers or unfinished file lists remain.
- Type consistency: roles use existing Prisma `UserRole` values: `RENTER`, `OWNER`, `ADMIN`.
- Scope check: this plan intentionally avoids OAuth, email verification delivery, image uploads, and payments. Those belong in later increments.
