# LeaseMate

[![LeaseMate CI](https://github.com/haodonguyen/lease-mate/actions/workflows/ci.yml/badge.svg)](https://github.com/haodonguyen/lease-mate/actions/workflows/ci.yml)

LeaseMate is a Victoria-first lease transfer and rental takeover marketplace for renters who currently rely on Facebook groups, screenshots, comments, and private messages to find someone to take over a lease.

The product focuses on a real Australian rental pain point: lease transfers and room replacements are often urgent, informal, and trust-sensitive. LeaseMate turns that messy workflow into structured listings, readiness checks, enquiries, saved listings, moderation, and startup validation analytics.

![LeaseMate marketplace screenshot](./public/leasemate-screenshot.png)

## What This Project Is About

Renters may need to leave a property before the lease ends because of relocation, financial pressure, study changes, or housemate changes. In practice, many people post lease-transfer requests in Facebook groups and then manage missing details, consent questions, inspections, and trust checks through comments and DMs.

LeaseMate improves that workflow with:

- Structured lease-transfer listings instead of scattered posts.
- Safety/readiness labels such as `Ready to transfer`, `Consent pending`, and `Needs caution`.
- Shareable listing pages that can still be posted back into Facebook groups or student communities.
- In-app enquiry workflow.
- Owner dashboard for managing listings and enquiries.
- Admin moderation queue for reported listings.
- Saved listings, waitlist capture, analytics events, and notification boundaries.

This is built as a realistic graduate/junior software engineering portfolio project, but the product concept is intentionally startup-ready.

## Features

- Public marketplace for Victorian rental listings.
- Search and filters by suburb, listing type, and readiness status.
- Shareable listing detail pages.
- Lease readiness and safety rules with unit tests.
- Prisma-backed PostgreSQL database.
- Demo role switching for renter, owner, and admin flows.
- Listing creation flow.
- Owner dashboard with listing status controls and enquiries.
- Saved listings for renters.
- Report listing flow.
- Admin moderation queue for reported listings.
- Waitlist form for startup validation.
- Analytics events for listing views, enquiries, saves, reports, shares, and waitlist signups.
- Console notification adapter that can be swapped for Resend later.
- Vitest unit tests and Playwright E2E tests.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation
- Vitest
- Playwright
- ESLint
- Lucide React icons
- CSS with custom design tokens

## Architecture

```text
src/
  app/                  Next.js routes, pages, and API endpoints
  components/           Reusable UI and client-side workflow components
  lib/                  Domain rules, mappers, and shared helpers
  lib/server/           Prisma services, auth helpers, analytics, notifications
prisma/
  schema.prisma         Data model
  seed.mjs              Demo data for local development
tests/
  *.test.ts             Vitest unit tests
  e2e/                  Playwright end-to-end tests
public/
  leasemate-screenshot.png
```

## Data Model

The Prisma schema includes:

- `User`
- `Listing`
- `ListingPhoto`
- `Enquiry`
- `Report`
- `SavedListing`
- `Notification`
- `AnalyticsEvent`
- `WaitlistSignup`

The app uses PostgreSQL through Prisma so the same database model can run locally, in CI, and in production on Vercel with Neon, Supabase, or Vercel Postgres.

## Getting Started

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Update `.env` with a local Postgres connection string or a development database URL before running the database commands.

Open:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js will show the available port in the terminal.

## Demo Accounts

Use the role switcher in the top navigation:

- `renter@leasemate.dev`
- `owner@leasemate.dev`
- `admin@leasemate.dev`

These are demo roles, not production authentication. They are included to make the portfolio workflows easy to inspect without OAuth setup.

## Quality Checks

```bash
npm test
npm run lint
npm run build
npm run e2e
```

Current coverage includes:

- Lease readiness and safety rules.
- Enquiry validation.
- Listing creation normalization.
- API input validation.
- Marketplace search E2E flow.
- Listing enquiry E2E flow.

## Deployment

LeaseMate is prepared for Vercel deployment with an explicit `vercel.json` build configuration and a `vercel-build` script that generates the Prisma Client before building Next.js.

Use a hosted PostgreSQL database such as Neon, Supabase, or Vercel Postgres and configure `DATABASE_URL` in Vercel environment variables.

See [docs/vercel-deployment.md](./docs/vercel-deployment.md) for the deployment checklist.

## GitHub-Safe Files

Files intended to be committed:

- `src/**`
- `prisma/schema.prisma`
- `prisma/seed.mjs`
- `tests/**`
- `public/leasemate-screenshot.png`
- `README.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `eslint.config.mjs`
- `playwright.config.ts`
- `vitest.config.ts`
- `.env.example`
- `.gitignore`

Files intentionally ignored:

- `.env`
- `node_modules/`
- `.next/`
- local database files
- `test-results/`
- `playwright-report/`
- log files

## Portfolio Talking Points

This project demonstrates:

- Product thinking around a real Australian rental market pain point.
- Full-stack TypeScript architecture.
- Prisma data modelling.
- Domain-driven safety/readiness rules.
- API validation and error handling.
- Role-based product workflows.
- Moderation and trust/safety considerations.
- Unit and E2E testing.
- Startup validation mechanics through waitlist and analytics events.

## Future Improvements

- Replace demo role switcher with Auth.js.
- Add real image uploads with Supabase Storage or UploadThing.
- Send production emails with Resend.
- Add suburb-level rental insights.
- Add richer moderation actions and audit logs.
- Add automated production migrations after the MVP data model settles.
