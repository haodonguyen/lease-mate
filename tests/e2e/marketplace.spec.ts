import { expect, test } from "@playwright/test";

test("search filters lease listings by suburb", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Victoria's trusted lease transfer marketplace." }),
  ).toBeVisible();
  await expect(page.locator(".listing-card")).toHaveCount(3);

  await page.getByLabel("Search listings").fill("Box Hill");

  await expect(page.locator(".listing-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Private room close to Box Hill station" })).toBeVisible();
});

test("listing enquiry submits through the API workflow", async ({ page }) => {
  await page.goto("/listings/brunswick-east-light-filled-apartment");

  await page.getByLabel("Name").fill("Harry Do");
  await page.getByLabel("Email").fill("harry@example.com");
  await page.getByLabel("Message").fill("Can I inspect this lease transfer this week?");
  await page.getByRole("button", { name: "Send enquiry" }).click();

  await expect(page.getByRole("status")).toContainText("Enquiry sent");
});
