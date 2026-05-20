import { describe, expect, it } from "vitest";
import { getAccountActionHref } from "../src/lib/account-navigation";

describe("account navigation", () => {
  it("routes signed-out users through login before account actions", () => {
    expect(getAccountActionHref({ isAuthenticated: false, targetPath: "/saved" })).toBe("/login?next=/saved");
    expect(getAccountActionHref({ isAuthenticated: false, targetPath: "/dashboard" })).toBe("/login?next=/dashboard");
    expect(getAccountActionHref({ isAuthenticated: false, targetPath: "/admin" })).toBe("/login?next=/admin");
    expect(getAccountActionHref({ isAuthenticated: false, targetPath: "/listings/new" })).toBe("/login?next=/listings/new");
  });

  it("keeps signed-in users on the requested account action", () => {
    expect(getAccountActionHref({ isAuthenticated: true, targetPath: "/saved" })).toBe("/saved");
  });
});
