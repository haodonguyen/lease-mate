# State-Aware Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a state-aware `/` homepage with a guest landing page and personalized authenticated home.

**Architecture:** Keep `src/app/page.tsx` as the data-loading router and move the two homepage variants into focused components. Reuse existing listing mapping, auth, saved-listing, owner-listing, and analytics services.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Prisma, Vitest, Playwright, CSS in `src/app/globals.css`.

---

### Task 1: Homepage Routing Tests

**Files:**
- Modify: `tests/e2e/marketplace.spec.ts`

- [ ] **Step 1: Add failing e2e assertions**

Add assertions that signed-out users see `Simplifying Victorian Lease Transfers.` and signed-in users see `Welcome back,`.

- [ ] **Step 2: Run e2e test to verify red**

Run: `npm run e2e`

Expected: guest/auth home assertions fail because the current homepage only renders the marketplace hero.

### Task 2: Homepage Components

**Files:**
- Create: `src/components/home/guest-landing.tsx`
- Create: `src/components/home/authenticated-home.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement guest landing**

Create a full guest landing component with hero search, trust strip, three transfer cards, featured listing preview, CTA, and marketplace listing access.

- [ ] **Step 2: Implement authenticated home**

Create a personalized home component with summary cards, progress card, recommended listings, and account-aware links.

- [ ] **Step 3: Wire route data**

Update `src/app/page.tsx` to load auth state, published listings, analytics, saved listings for renters, and owner listings for owners/admins, then render the correct component.

- [ ] **Step 4: Run e2e to verify green**

Run: `npm run e2e`

Expected: all homepage e2e tests pass.

### Task 3: Visual Polish

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/app-header.tsx`

- [ ] **Step 1: Add responsive homepage styles**

Add layout, card, hero, authenticated-home, and mobile styles matching the supplied visual direction while preserving existing marketplace and detail page classes.

- [ ] **Step 2: Simplify header hierarchy**

Keep guest nav focused on Marketplace, How it Works, Security, Sign in, and Join. Keep signed-in nav focused on Marketplace, saved/dashboard account actions, search icon, and logout.

### Task 4: Verification And Release

**Files:**
- No source changes expected unless verification exposes defects.

- [ ] **Step 1: Run full checks**

Run: `npm run lint`, `npm test`, `npm run e2e`, and `npm run vercel-build`.

- [ ] **Step 2: Browser smoke check**

Open local app in the browser and verify guest `/`, authenticated flow, and mobile layout are readable.

- [ ] **Step 3: Commit, push, deploy**

Commit the feature, push to GitHub, deploy with `npx vercel --prod --yes`, and verify the production URL.
