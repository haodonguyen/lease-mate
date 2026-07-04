import { describe, expect, it } from "vitest";
import {
  canManageListings,
  canModerate,
  getCurrentAuthenticatedUser,
  isValidLoginInput,
  isValidSignupInput,
} from "../src/lib/server/auth";

describe("session lookup", () => {
  it("exposes the authenticated session lookup", () => {
    expect(typeof getCurrentAuthenticatedUser).toBe("function");
  });
});

describe("auth rules", () => {
  it("validates login payload shape", () => {
    expect(isValidLoginInput({ email: "renter@example.com", password: "aStrongPass1" }).ok).toBe(true);
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
