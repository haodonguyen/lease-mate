import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "../src/lib/auth-redirect";

describe("auth redirects", () => {
  it("keeps local application paths", () => {
    expect(getSafeRedirectPath("/listings/new")).toBe("/listings/new");
    expect(getSafeRedirectPath("/dashboard?tab=listings")).toBe("/dashboard?tab=listings");
  });

  it("falls back for missing or unsafe redirect targets", () => {
    expect(getSafeRedirectPath(undefined)).toBe("/dashboard");
    expect(getSafeRedirectPath("https://evil.example/listings/new")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.example/listings/new")).toBe("/dashboard");
    expect(getSafeRedirectPath("listings/new")).toBe("/dashboard");
  });
});
