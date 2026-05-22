# LeaseMate

[![LeaseMate CI](https://github.com/haodonguyen/lease-mate/actions/workflows/ci.yml/badge.svg)](https://github.com/haodonguyen/lease-mate/actions/workflows/ci.yml)

LeaseMate is a Victoria-first lease transfer and rental takeover marketplace. It turns informal Facebook-group lease transfers into structured listings, safer readiness checks, saved shortlists, enquiries, owner workflows, and admin moderation.

Live production app: [https://lease-mate-three.vercel.app](https://lease-mate-three.vercel.app)

![LeaseMate marketplace screenshot](./public/leasemate-screenshot.png)

## Product Problem

Renters often need someone to take over a lease quickly because of relocation, study changes, financial pressure, or housemate turnover. The current workflow usually happens across Facebook posts, screenshots, comments, and private messages, which makes important details easy to miss:

- Has the rental provider or agent approved the transfer?
- Is the bond transfer discussed?
- Are lease dates and availability clear?
- Is the listing a lease transfer, room replacement, or temporary sublet?
- Can renters compare options after saving them?

LeaseMate models this as a professional marketplace and account workflow instead of a scattered social-media thread.

## Current Features

- State-aware homepage:
  - guests see a polished landing page and marketplace preview
  - authenticated users see a personalized home with saved/owner signals
- Dedicated `/marketplace` route for full listing search and filtering
- Real email/password sign up and sign in with server-side sessions
- Role-aware navigation for renters, owners, and admins
- Public listing detail pages with readiness labels
- Listing creation and edit flow for owners/admins
- Owner dashboard with listing status controls and enquiries
- Saved listings with shortlist status and private notes
- Enquiry workflow for renters
- Report listing workflow
- Admin moderation queue for reported listings
- Waitlist capture for startup validation
- Analytics events and notification-service boundaries
- Vitest unit tests and Playwright E2E tests
- GitHub Actions CI and Vercel production deployment

## Main Workflows

### Guest

1. Lands on `/`
2. Reads the product positioning
3. Searches or filters listings through `/marketplace`
4. Opens listing detail pages
5. Signs up or joins the waitlist when ready

### Renter

1. Signs up or signs in
2. Lands on authenticated home
3. Browses `/marketplace`
4. Saves listings and tracks shortlist status in `/saved`
5. Sends enquiries from listing detail pages

### Owner/Admin

1. Signs in with an owner/admin account
2. Creates a lease transfer listing
3. Manages listings and enquiries from `/dashboard`
4. Admins can also review reports in `/admin`

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
- Vercel + Neon Postgres in production

## Architecture

```text
src/
  app/                         Next.js pages and API route handlers
    marketplace/               Full public marketplace route
    api/                       Auth, listings, enquiries, reports, saved listings
  components/                  Reusable UI and workflow components
    auth/                      Login, signup, logout, demo role switcher
    home/                      Guest landing and authenticated home
  lib/                         Domain rules, mappers, validation, shared helpers
  lib/server/                  Prisma services, auth, analytics, notifications

prisma/
  schema.prisma                PostgreSQL data model
  migrations/                  Production migration history
  seed.mjs                     Demo data for local development and E2E tests

tests/
  *.test.ts                    Vitest unit tests
  e2e/                         Playwright end-to-end tests

public/
  leasemate-screenshot.png     README/project preview image
```

## Data Model

The Prisma schema includes:

- `User`
- `Session`
- `Listing`
- `ListingPhoto`
- `Enquiry`
- `Report`
- `SavedListing`
- `Notification`
- `AnalyticsEvent`
- `WaitlistSignup`

The app uses PostgreSQL through Prisma so the same model works locally, in CI, and in production.

## Environment Variables

Create a local `.env` file in the project root:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

Use a development database, not the production database, for local work. Neon, Supabase, Vercel Postgres, or a local PostgreSQL instance all work.

`.env` and `.env.local` files are intentionally ignored and should not be committed.

## Local Setup

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is busy, Next.js will print the available local URL.

## Demo Accounts

Seeded accounts use this password:

```text
LeaseMate123!
```

Accounts:

- `renter@leasemate.dev`
- `owner@leasemate.dev`
- `admin@leasemate.dev`

The app also includes a development role switcher when demo auth is enabled, but production workflows use the real session-based login/signup routes.

## Quality Checks

```bash
npm run lint
npm test
npm run e2e
npm run build
npm run vercel-build
```

Current coverage includes:

- Auth validation and signup/login API behavior
- Session helpers
- Lease readiness and safety rules
- Listing creation/update normalization
- Saved listing shortlist updates
- Enquiry validation
- API input validation
- Marketplace search
- Authenticated marketplace access
- Renter-specific navigation
- Signup and saved-listing workflows
- Listing enquiry workflow

## Deployment

LeaseMate is deployed to Vercel and backed by hosted PostgreSQL.

Production URL:

```text
https://lease-mate-three.vercel.app
```

The production build path runs:

```bash
prisma migrate deploy
prisma generate
next build
```

Required Vercel environment variable:

```text
DATABASE_URL
```

See [docs/vercel-deployment.md](./docs/vercel-deployment.md) for the detailed deployment checklist.

## GitHub-Safe Files

Commit these:

- `src/**`
- `prisma/schema.prisma`
- `prisma/migrations/**`
- `prisma/seed.mjs`
- `tests/**`
- `public/**`
- `docs/**`
- `.github/workflows/**`
- `README.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `eslint.config.mjs`
- `playwright.config.ts`
- `vitest.config.ts`
- `.gitignore`
- `vercel.json`

Do not commit these:

- `.env`
- `.env.local`
- `node_modules/`
- `.next/`
- `.vercel/`
- `test-results/`
- `playwright-report/`
- local database files
- log files
- `code-review.md`

## Portfolio Talking Points

This project demonstrates:

- Product thinking around a real Australian rental-market pain point
- Full-stack TypeScript and Next.js App Router development
- PostgreSQL and Prisma data modelling
- Session-based authentication
- Role-aware user journeys
- Trust, safety, and moderation workflows
- Domain-driven readiness rules
- API validation and error handling
- Unit, integration-style, and E2E testing
- CI/CD with GitHub Actions and Vercel
- Production deployment with hosted Postgres

## Future Improvements

- Real image uploads with Vercel Blob, Cloudinary, UploadThing, or Supabase Storage
- Email verification and password reset
- Real renter-owner messaging inbox
- Search history persisted per user
- Suburb-level rental insights
- Richer admin audit trails
- Notification delivery through Resend or another email provider
- Accessibility pass with automated checks
