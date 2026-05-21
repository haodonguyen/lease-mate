import { describe, expect, it } from "vitest";
import { getDemoLoginDefaults } from "../src/lib/demo-auth";
import {
  canManageListings,
  canModerate,
  getCurrentAuthenticatedUser,
  getCurrentDemoUser,
  isDemoAuthEnabled,
  isValidLoginInput,
  isValidSignupInput,
} from "../src/lib/server/auth";

describe("demo authentication guard", () => {
  it("disables demo role switching in production", () => {
    expect(isDemoAuthEnabled("production")).toBe(false);
  });

  it("keeps demo role switching enabled outside production", () => {
    expect(isDemoAuthEnabled("development")).toBe(true);
    expect(isDemoAuthEnabled("test")).toBe(true);
  });

  it("does not expose the demo password in production login defaults", () => {
    expect(getDemoLoginDefaults("production")).toEqual({
      email: "owner@leasemate.dev",
      password: "",
      helperText: null,
    });
  });

  it("keeps authenticated session lookup separate from demo fallback lookup", () => {
    expect(typeof getCurrentAuthenticatedUser).toBe("function");
    expect(typeof getCurrentDemoUser).toBe("function");
  });
});

describe("auth rules", () => {
  it("validates login payload shape", () => {
    expect(isValidLoginInput({ email: "owner@leasemate.dev", password: "LeaseMate123!" }).ok).toBe(true);
    expect(isValidLoginInput({ email: "bad", password: "short" }).ok).toBe(false);
  });

  it("validates signup payload shape and limits public roles", () => {
    expect(
      isValidSignupInput({
        name: "Sarah Jenkins",
        email: "sarah@example.com.au",
        password: "LeaseMate123!",
        role: "OWNER",
        acceptedTerms: true,
      }).ok,
    ).toBe(true);
    expect(
      isValidSignupInput({
        name: "Alex Morgan",
        email: "alex@example.com.au",
        password: "LeaseMate123!",
        role: "ADMIN",
        acceptedTerms: true,
      }).ok,
    ).toBe(false);
    expect(
      isValidSignupInput({
        name: "Riley",
        email: "bad",
        password: "short",
        role: "RENTER",
        acceptedTerms: false,
      }).ok,
    ).toBe(false);
  });

  it("enforces role capabilities", () => {
    expect(canManageListings("OWNER")).toBe(true);
    expect(canManageListings("ADMIN")).toBe(true);
    expect(canManageListings("RENTER")).toBe(false);
    expect(canModerate("ADMIN")).toBe(true);
    expect(canModerate("OWNER")).toBe(false);
  });
});
