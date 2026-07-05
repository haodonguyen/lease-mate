# LeaseMate

[![LeaseMate CI](https://github.com/haodonguyen/lease-mate/actions/workflows/ci.yml/badge.svg)](https://github.com/haodonguyen/lease-mate/actions/workflows/ci.yml)

**LeaseMate is a structured marketplace for Australian lease transfers** — taking over, subletting, or replacing a room on an existing rental agreement.

It replaces the scattered Facebook-group posts and DM threads that renters (originally, Vietnamese international students in Melbourne) rely on today with proper listings: transparent rent and bond, transfer-readiness signals, structured amenities, saved shortlists, and a real enquiry loop with transactional email.

**Live app → [lease-mate-three.vercel.app](https://lease-mate-three.vercel.app)**

![LeaseMate marketplace](./public/leasemate-screenshot.png)

LeaseMate is open-source and free to use — it exists to make lease transfers safer and clearer, not to make money.

---

## Try the demo

The fastest way to see it is the [live app](https://lease-mate-three.vercel.app). You can browse the whole marketplace as a guest. To try posting, saving, and enquiring, sign up with any email — or, on a local install, use the seeded accounts below.

**Guided walkthrough (≈2 minutes):**

1. **Browse** — open the [marketplace](https://lease-mate-three.vercel.app/marketplace). Filter by suburb, price, bedrooms, move-in date, housemate preference, furnishing, bills, and amenities. Filters are stored in the URL, so any search is shareable.
2. **Inspect a listing** — open a listing to see the photo gallery, rent/bond, lease dates, structured amenities, and an explained **transfer-readiness score** (has the provider consented? is the bond sorted? is the new renter on the lease?).
3. **Sign up** — create an account to unlock the member actions below.
4. **Save** — shortlist listings and track each one as *Interested → Inspecting → Applied*.
5. **Enquire** — message a lister. They receive an email notification and you get a confirmation (both via Resend).
6. **Post** — list your own lease transfer with photos, amenities, and readiness details, then manage status and reply to enquiries from your dashboard.

### Seeded demo accounts (local install only)

After `npm run db:seed`, these accounts exist. Shared password: **`LeaseMate123!`**

| Account | Purpose |
|---|---|
| `demo@leasemate.dev` | Owns the sample listings — sign in to see a populated dashboard and enquiry inbox. |
| `browser@leasemate.dev` | A second member — has a saved listing and a sent enquiry. |

Any signed-in member can both post listings and browse/save/enquire — there is a single access model, no separate renter/owner/admin roles.

---

## Features

- **Public marketplace** for lease transfers, room replacements, and short-term sublets.
- **Shareable, URL-persisted search** — suburb/keyword, listing type, price range, bedrooms, available-by date, transfer readiness, housemate preference, furnishing, bills-included, and a 15-item **structured amenity filter** (listings must match every selected amenity).
- **Rich listing pages** — interactive photo gallery with lightbox, rent, bond, lease dates, highlights, amenity tags, and an **explained transfer-readiness score** derived from consent/bond/lease checklist state.
- **Authentication** — email + password with server-side sessions, email verification, and password reset (all custom, rate-limited).
- **Member accounts** — inline saved-listing shortlist with status tracking, a sent-enquiry inbox, and an account page with display-name and verified change-password flows.
- **Enquiry loop with real email** — enquiring notifies the lister and confirms to the enquirer; listers reply by email from their dashboard (Resend).
- **Listing management** — create/edit with photo uploads (UploadThing), all Australian states and territories, status control, and readiness capture.
- **Report a listing** for review.
- **SEO** — per-listing Open Graph/Twitter metadata, `RealEstateListing` JSON-LD, dynamic sitemap, and robots.txt.
- **Responsive UI** with a mobile navigation drawer, loading skeletons, and a hand-built "editorial luxury" design system in plain CSS.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC) · React 19 · TypeScript |
| Data | Prisma ORM · PostgreSQL (Neon) |
| Validation | Zod at every API boundary |
| Media / email | UploadThing (photos) · Resend (transactional email) |
| Testing | Vitest (unit/integration) · Playwright (e2e) |
| Tooling | ESLint · GitHub Actions CI |
| Hosting | Vercel |

## Architecture

```text
src/
  app/                Next.js pages and API route handlers
    api/              Auth, listings, enquiries, reports, saved listings, uploads
    marketplace/      Public marketplace route
  components/         UI and workflow components (auth, home, listing, account)
  lib/                Domain rules, filters, validation, mappers, shared helpers
  lib/server/         Prisma services, auth, sessions, email, analytics, rate limiting

prisma/
  schema.prisma       PostgreSQL data model
  migrations/         Migration history (applied via `prisma migrate deploy`)
  seed.mjs            Sample accounts and listings for local development

tests/
  *.test.ts           Unit and integration tests (Vitest)
  e2e/                End-to-end tests (Playwright)
```

The codebase keeps a strict boundary: **domain logic and validation live in `lib/`**, **all database and I/O access lives in `lib/server/`**, and **route handlers stay thin** — parse input with Zod, call a service, return a response. Business rules (transfer readiness, lease rules, amenity vocabulary, filter predicates) are pure functions with dedicated unit tests.

## Data model

PostgreSQL via Prisma. Core entities: `User`, `Session`, `Listing`, `ListingPhoto`, `Enquiry`, `Report`, `SavedListing`, `Notification`, `AnalyticsEvent`, `WaitlistSignup`, plus email-verification and password-reset token tables.

## Local setup

Requires Node 22+ and a PostgreSQL database (a free [Neon](https://neon.tech) database works well).

```bash
npm install
```

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
UPLOADTHING_TOKEN="your-uploadthing-token"        # optional locally; needed for photo uploads
RESEND_API_KEY="your-resend-api-key"              # optional locally; needed to send email
RESEND_FROM_EMAIL="LeaseMate <hello@your-domain.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Prepare the database and start the app:

```bash
npm run db:push    # apply the schema
npm run db:seed    # load sample accounts and listings
npm run dev        # http://localhost:3000
```

## Testing

```bash
npm run lint       # ESLint
npm test           # Vitest unit + integration suite
npm run build      # production build
```

End-to-end tests reset and seed their database — point them at a dedicated test database:

```bash
TEST_DATABASE_URL="postgresql://USER:PASSWORD@HOST/TEST_DATABASE?sslmode=require" npm run e2e
```

## Deployment

Deployed on Vercel against a hosted PostgreSQL database. The production build runs migrations, generates the Prisma client, and builds the app:

```bash
prisma migrate deploy && prisma generate && next build
```

Required production environment variables: `DATABASE_URL`, `UPLOADTHING_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`.

## License

[MIT](./LICENSE)
