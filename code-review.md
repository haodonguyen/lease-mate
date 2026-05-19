# Principal Engineer Code Review

Date: 2026-05-16

Scope reviewed: current uncommitted auth/session/login work, Prisma session migration, listing ownership tests, and related UI changes.

## Resolution Status

Updated: 2026-05-20

The review findings below were addressed before pushing:

- `canUpdateListingStatus` is implemented and covered by listing-service tests.
- Admin listing-status updates now pass the acting user into the service and are authorized by role plus ownership.
- Production demo users in Neon were backfilled with password hashes without reseeding/destructive data resets.
- Production login no longer pre-fills or displays the shared demo password.
- Authenticated session lookup is separated from development demo fallback lookup.
- `/api/auth/login` now uses the existing rate limiter.

Current verification:

```text
npm test
Test Files  9 passed (9)
Tests       35 passed (35)

npm run lint
passed

npx prisma validate
The schema at prisma/schema.prisma is valid
```

## Findings

### P0 - Ownership tests fail because `canUpdateListingStatus` is imported but not implemented

Files:
- `tests/listing-service.test.ts:4`
- `tests/listing-service.test.ts:181`
- `src/lib/server/listing-service.ts:212`

The new listing ownership tests import and call `canUpdateListingStatus`, but `src/lib/server/listing-service.ts` does not export that function. This leaves the test suite red and blocks a safe commit/deploy.

Evidence:

```text
npm test -- tests/auth.test.ts tests/password.test.ts tests/session.test.ts tests/listing-service.test.ts
Test Files  1 failed | 3 passed
Tests       2 failed | 14 passed
TypeError: canUpdateListingStatus is not a function
```

Recommended fix:

Add a pure helper:

```ts
export function canUpdateListingStatus(
  actor: { id: string; role: UserRole },
  listingOwnerId: string,
) {
  return actor.role === "ADMIN" || (actor.role === "OWNER" && actor.id === listingOwnerId);
}
```

Then update `updateListingStatus` to accept the actor, fetch by listing id, return not found for missing listings, and reject unauthorized users separately.

---

### P1 - Admins are allowed by the route guard but still cannot update other users' listings

Files:
- `src/app/api/listings/status/route.ts:11`
- `src/app/api/listings/status/route.ts:25`
- `src/lib/server/listing-service.ts:212`

The route permits both `OWNER` and `ADMIN` through `canManageListings`, but then calls:

```ts
updateListingStatus(parsed.data.listingId, user.id, parsed.data.status)
```

The service treats the second argument as `ownerId` and searches with:

```ts
where: { id: listingId, ownerId }
```

That means an admin can only update listings they personally own. This contradicts the admin role model and the newly added test expectation.

Recommended fix:

Pass the whole actor into the service:

```ts
await updateListingStatus(parsed.data.listingId, user, parsed.data.status)
```

Then use `canUpdateListingStatus(user, listing.ownerId)` inside the service.

---

### P1 - Existing production users will not be able to log in after migration unless their `passwordHash` is backfilled

Files:
- `prisma/migrations/20260516090000_add_sessions/migration.sql:2`
- `src/lib/server/auth.ts:83`
- `src/lib/server/auth.ts:89`
- `prisma/seed.mjs:137`

The migration adds nullable `passwordHash`, but it does not backfill existing users. The seed script adds password hashes, but Vercel build only runs `prisma migrate deploy`, not `npm run db:seed`. On an already seeded production database, `owner@leasemate.dev`, `renter@leasemate.dev`, and `admin@leasemate.dev` may remain with `passwordHash = null`, causing login to fail.

Recommended fix:

Choose one:

1. Add a one-off safe data migration/backfill for known demo users.
2. Run `npm run db:seed` manually after deploying the session migration.
3. Build a proper signup/reset flow and stop advertising seeded credentials.

For this portfolio stage, option 2 is acceptable if documented clearly in deployment notes.

---

### P2 - The login form publicly pre-fills the demo password

Files:
- `src/components/auth/login-form.tsx:56`
- `src/app/login/page.tsx:36`

The password field has:

```tsx
defaultValue="LeaseMate123!"
```

And the page displays the shared password. This is convenient for a demo, but it weakens the production story because anyone can sign into seeded demo accounts. If the project is pitched as realistic and startup-capable, credentials should not be prefilled in production.

Recommended fix:

Keep demo hints only in development, or show a "Try demo as owner" button that is explicitly labelled as a portfolio demo. In production, remove the password default value.

---

### P2 - `getCurrentUser()` makes local login testing awkward because development always falls back to a demo renter

Files:
- `src/lib/server/auth.ts:38`
- `src/lib/server/auth.ts:42`
- `src/app/login/page.tsx:19`

Outside production, `getCurrentUser()` falls back to `demoUsers[0]` if no session exists. Because the login page checks `currentUser`, local development will often show "You are signed in as Riley Nguyen" instead of the login form.

Recommended fix:

Separate "current authenticated session" from "demo role fallback":

```ts
getCurrentUser()
getCurrentDemoUser()
```

Use the demo fallback only where the role switcher/demo pages need it. Use real session lookup on `/login`.

---

### P2 - Login/logout endpoints lack request throttling

Files:
- `src/app/api/auth/login/route.ts:5`
- `src/app/api/auth/logout/route.ts:4`

The app already has rate-limit utilities elsewhere. Login should apply rate limiting by IP/email to avoid credential stuffing and noisy abuse, especially because this is now a password-based endpoint.

Recommended fix:

Apply the existing rate limiter to `/api/auth/login`, returning `429` after a small threshold.

---

## Verification Run

Commands run:

```text
npm test -- tests/auth.test.ts tests/password.test.ts tests/session.test.ts tests/listing-service.test.ts
npm run lint
npx prisma validate
```

Results:

```text
Auth/password/session targeted tests: pass
Listing-service ownership tests: fail, 2 failing tests
Lint: pass
Prisma validate: pass
```

## Current Worktree Notes

The worktree contains uncommitted auth/session/login changes. There is also an existing local deletion of `.env.example`; this review did not assess whether that deletion is intentional.

## Recommended Next Fix Order

1. Implement `canUpdateListingStatus` and update the listing status route/service.
2. Re-run `npm test -- tests/listing-service.test.ts tests/auth.test.ts`.
3. Decide how to backfill demo users' `passwordHash` in Neon.
4. Remove or gate the prefilled demo password in production.
5. Run full `npm test`, `npm run lint`, and `npx prisma validate`.
