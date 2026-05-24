import { describe, expect, it } from "vitest";
import {
  getAuthTokenExpiry,
  hashAuthToken,
  isAuthTokenExpired,
  normaliseResetPasswordInput,
  normaliseRequestPasswordResetInput,
  normaliseVerifyEmailInput,
} from "../src/lib/server/auth-tokens";

describe("auth token helpers", () => {
  it("hashes one-time auth tokens without exposing the raw token", () => {
    const token = "raw-token-value";
    const hash = hashAuthToken(token);

    expect(hash).not.toBe(token);
    expect(hash).toHaveLength(64);
    expect(hashAuthToken(token)).toBe(hash);
  });

  it("calculates expiring one-time token windows", () => {
    const now = new Date("2026-05-24T00:00:00.000Z");
    const expiresAt = getAuthTokenExpiry(30, now);

    expect(expiresAt.toISOString()).toBe("2026-05-24T00:30:00.000Z");
    expect(isAuthTokenExpired(expiresAt, new Date("2026-05-24T00:29:59.000Z"))).toBe(false);
    expect(isAuthTokenExpired(expiresAt, new Date("2026-05-24T00:30:00.000Z"))).toBe(true);
  });

  it("validates email verification token input", () => {
    expect(normaliseVerifyEmailInput({ token: "abc123" })).toEqual({ ok: true, token: "abc123" });
    expect(normaliseVerifyEmailInput({ token: "" })).toEqual({
      ok: false,
      error: "Verification link is invalid",
    });
  });

  it("validates password reset request input without leaking account existence", () => {
    expect(normaliseRequestPasswordResetInput({ email: " Sarah@Example.com " })).toEqual({
      ok: true,
      email: "sarah@example.com",
    });
    expect(normaliseRequestPasswordResetInput({ email: "bad" })).toEqual({
      ok: false,
      error: "Enter a valid email address",
    });
  });

  it("validates password reset token and password input", () => {
    expect(normaliseResetPasswordInput({ token: "abc123", password: "LeaseMate123!" })).toEqual({
      ok: true,
      token: "abc123",
      password: "LeaseMate123!",
    });
    expect(normaliseResetPasswordInput({ token: "", password: "short" })).toEqual({
      ok: false,
      error: "Reset link is invalid",
    });
  });
});
