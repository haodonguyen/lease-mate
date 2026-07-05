import { describe, expect, it } from "vitest";
import {
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

  it("validates signup payload shape", () => {
    expect(
      isValidSignupInput({
        name: "Sarah Jenkins",
        email: "sarah@example.com.au",
        password: "aStrongPass1",
        acceptedTerms: true,
      }).ok,
    ).toBe(true);
    expect(
      isValidSignupInput({
        name: "Riley",
        email: "bad",
        password: "short",
        acceptedTerms: false,
      }).ok,
    ).toBe(false);
  });
});
