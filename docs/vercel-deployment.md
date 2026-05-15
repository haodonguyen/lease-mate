# Vercel Deployment Guide

LeaseMate is a Next.js App Router application and is a good fit for Vercel. The application should be deployed with a hosted PostgreSQL database so listing, enquiry, save, report, analytics, and waitlist data persist beyond a single serverless request.

## Recommended Setup

- Hosting: Vercel
- Database: Neon Postgres, Supabase Postgres, or Vercel Postgres
- CI: GitHub Actions
- Production branch: `main`

## Why PostgreSQL?

Vercel deployments run in serverless environments, so a local SQLite file is not a durable production database. Writes may not persist reliably and database files should not be committed to GitHub. LeaseMate uses Prisma with PostgreSQL for the production-ready deployment path.

## Deployment Steps

1. Push the latest `main` branch to GitHub.
2. Create a hosted Postgres database using Neon, Supabase, or Vercel Postgres.
3. Copy the database connection string.
4. In Vercel, import the GitHub repository `haodonguyen/lease-mate`.
5. Set the project framework preset to `Next.js`.
6. Add the environment variable:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

7. Set the production branch to `main`.
8. Deploy the project.
9. Run the Prisma schema push and seed command against the production database before sharing the app publicly:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require" npx prisma db push
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require" npm run db:seed
```

## Prisma Datasource

LeaseMate is configured for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

For local development, use a local Postgres database or a development branch/database from Neon or Supabase.

## Vercel Build Settings

The repository includes `vercel.json` so Vercel uses:

```bash
npm ci
npm run vercel-build
```

The `vercel-build` script runs Prisma Client generation before the Next.js production build.

## Portfolio Talking Point

Use this phrasing in interviews:

> I deployed LeaseMate as a production-style Next.js marketplace on Vercel, backed by PostgreSQL and Prisma. CI runs Prisma setup, unit tests, linting, and production builds before deployment.
