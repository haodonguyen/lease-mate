# LeaseMate

[![LeaseMate CI](https://github.com/haodonguyen/lease-mate/actions/workflows/ci.yml/badge.svg)](https://github.com/haodonguyen/lease-mate/actions/workflows/ci.yml)

LeaseMate is an Australia-wide lease transfer marketplace for renters who need to move into, take over, or transfer an existing rental agreement. The platform replaces scattered social media posts with structured listings, verified transfer readiness, account-based saved listings, renter enquiries, owner workflows, and admin moderation.

Live app: [https://lease-mate-three.vercel.app](https://lease-mate-three.vercel.app)

![LeaseMate marketplace screenshot](./public/leasemate-screenshot.png)

## Overview

Lease transfers are often managed through Facebook groups, screenshots, private messages, and informal comments. That makes it difficult for renters to understand whether a listing is legitimate, whether the rental provider has been contacted, what lease dates apply, and what transfer steps remain.

LeaseMate presents lease transfers as a professional rental marketplace. Listings include key rental details, availability dates, readiness indicators, consent status, bond context, saved-listing workflows, enquiries, and moderation tools. The goal is to make lease transfers clearer for renters while giving outgoing tenants and owners a structured way to manage handovers.

## Core Features

- Public marketplace for lease transfers, room replacements, and short-term sublets
- Search and filtering by suburb, listing type, and readiness status
- Listing detail pages with rent, bond, availability, lease dates, highlights, and readiness checks
- Email and password authentication with server-side sessions
- Renter accounts with saved listings and enquiry workflows
- Owner dashboard for listing management, status updates, and enquiries
- Listing creation and editing flow with photo uploads and Australian state and territory support
- Admin moderation queue for reported listings
- Waitlist capture for early product validation
- Analytics and notification service boundaries
- Responsive UI designed for desktop and mobile rental search workflows

## User Workflows

### Guest

1. Browse the landing page and marketplace.
2. Search or filter available lease transfers.
3. Open listing details to review rent, dates, readiness, and transfer context.
4. Sign up to save listings or contact the lister.

### Renter

1. Create an account or sign in.
2. Browse listings from the marketplace.
3. Save listings into a private shortlist.
4. Send enquiries from listing detail pages.
5. Track saved listing status and notes from the saved listings page.

### Owner

1. Sign in to an owner account.
2. Create a structured lease transfer listing.
3. Manage listing status, readiness, and enquiries from the dashboard.
4. Update listing details as the transfer progresses.

### Admin

1. Review reported listings.
2. Approve, flag, or remove listings from the moderation queue.
3. Maintain marketplace trust and listing quality.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- Vitest
- Playwright
- ESLint
- Lucide React
- UploadThing
- Vercel
- Neon Postgres

## Architecture

```text
src/
  app/                         Next.js pages and API route handlers
    api/                       Auth, listings, enquiries, reports, saved listings
    marketplace/               Public marketplace route
  components/                  Reusable UI and workflow components
    auth/                      Authentication forms and session controls
    home/                      Guest and authenticated home experiences
  lib/                         Domain rules, validation, mappers, shared helpers
  lib/server/                  Prisma services, auth, analytics, notifications

prisma/
  schema.prisma                PostgreSQL data model
  migrations/                  Database migration history
  seed.mjs                     Demo data for local development and tests

tests/
  *.test.ts                    Unit and integration tests
  e2e/                         Playwright end-to-end tests

public/
  leasemate-screenshot.png     Project preview image
```

## Data Model

LeaseMate uses PostgreSQL through Prisma. The main data entities are:

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

## Local Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
UPLOADTHING_TOKEN="your-uploadthing-token"
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="LeaseMate <hello@your-domain.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Prepare the database:

```bash
npm run db:push
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Demo Accounts

Seeded demo accounts use this password:

```text
LeaseMate123!
```

Available accounts:

- `renter@leasemate.dev`
- `owner@leasemate.dev`
- `admin@leasemate.dev`

## Testing

```bash
npm run lint
npm test
npm run e2e
npm run build
```

## Deployment

LeaseMate is deployed on Vercel and uses a hosted PostgreSQL database.

Production URL:

```text
https://lease-mate-three.vercel.app
```

Production builds run database migrations, generate the Prisma client, and build the Next.js application:

```bash
prisma migrate deploy
prisma generate
next build
```

Required production environment variable:

```text
DATABASE_URL
UPLOADTHING_TOKEN
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_APP_URL
```
