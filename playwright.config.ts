import { defineConfig, devices } from "@playwright/test";

const e2eDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!e2eDatabaseUrl && !process.env.PLAYWRIGHT_SKIP_DB_SETUP) {
  throw new Error("Set TEST_DATABASE_URL before running e2e, or start the app yourself and set PLAYWRIGHT_SKIP_DB_SETUP=1.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3110",
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.PLAYWRIGHT_SKIP_DB_SETUP
      ? "npm run dev -- --hostname 127.0.0.1 --port 3110"
      : 'DATABASE_URL="$TEST_DATABASE_URL" npm run db:push && DATABASE_URL="$TEST_DATABASE_URL" npm run db:seed && DATABASE_URL="$TEST_DATABASE_URL" npm run dev -- --hostname 127.0.0.1 --port 3110',
    url: "http://127.0.0.1:3110",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
