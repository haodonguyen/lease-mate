import { expect, test } from "@playwright/test";

test("search filters lease listings by suburb", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Simplifying Australian Lease Transfers." }),
  ).toBeVisible();
  await expect(page.getByText("Built around Australian rental guidance")).toBeVisible();
  await expect(page.getByText("Verified by Consumer Affairs")).toHaveCount(0);
  await expect(page.locator(".listing-card")).toHaveCount(3);

  await page.getByRole("textbox", { name: "Search listings" }).fill("Box Hill");

  await expect(page.locator(".listing-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Private room close to Box Hill station" })).toBeVisible();
});

test("authenticated renter lands on personalized home", async ({ page }) => {
  const response = await page.request.post("/api/auth/login", {
    data: {
      email: "renter@leasemate.dev",
      password: "LeaseMate123!",
    },
  });
  expect(response.ok()).toBeTruthy();

  await page.goto("/");
  await expect(page).toHaveURL(/127\.0\.0\.1:3110\/$/);
  await expect(page.getByRole("heading", { name: /Welcome back,/ })).toBeVisible();
  await expect(page.getByText("Recommended for you")).toBeVisible();
  await expect(page.getByText("Your saved shortlist")).toBeVisible();
  await expect(page.getByText("Based on currently available Australian lease transfers.")).toBeVisible();
  await expect(page.getByText("Richmond and Cremorne")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Simplifying Australian Lease Transfers." })).toHaveCount(0);
});

test("authenticated renter can open and search the full marketplace", async ({ page }) => {
  const response = await page.request.post("/api/auth/login", {
    data: {
      email: "renter@leasemate.dev",
      password: "LeaseMate123!",
    },
  });
  expect(response.ok()).toBeTruthy();

  await page.goto("/");
  await page.getByRole("link", { name: "Marketplace", exact: true }).click();

  await expect(page).toHaveURL(/\/marketplace#listings$/);
  await expect(page.locator(".listing-card")).toHaveCount(3);

  await page.getByLabel("Search listings").fill("Box Hill");

  await expect(page.locator(".listing-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Private room close to Box Hill station" })).toBeVisible();
});

test("renter navigation only shows renter account actions", async ({ page }) => {
  const response = await page.request.post("/api/auth/login", {
    data: {
      email: "renter@leasemate.dev",
      password: "LeaseMate123!",
    },
  });
  expect(response.ok()).toBeTruthy();

  await page.goto("/");
  const header = page.locator("header");

  await expect(header.getByRole("link", { name: "Saved listings" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Dashboard" })).toHaveCount(0);
  await expect(header.getByRole("link", { name: "List transfer" })).toHaveCount(0);
});

test("listing enquiry submits through the API workflow", async ({ page }) => {
  await page.goto("/listings/brunswick-east-light-filled-apartment");

  await page.getByLabel("Name").fill("Harry Do");
  await page.getByLabel("Email").fill("harry@example.com");
  await page.getByLabel("Message").fill("Can I inspect this lease transfer this week?");
  await page.getByRole("button", { name: "Send enquiry" }).click();

  await expect(page.getByRole("status")).toContainText("Enquiry sent");
});

test("renter can create an account and land in saved listings", async ({ page }) => {
  await page.goto("/signup");

  await page.getByLabel("Full name").fill("Jamie Wilson");
  await page.getByLabel("Email address").fill("jamie.signup@example.com");
  await page.getByLabel("Password").fill("LeaseMate123!");
  await page.getByRole("checkbox", { name: /I agree to the Terms of Service/ }).check();
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/saved$/);
  await expect(page.getByRole("heading", { name: "Saved listings" })).toBeVisible();
});
