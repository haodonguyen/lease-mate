import { describe, expect, it } from "vitest";
import { createSessionToken, hashSessionToken, isSessionExpired } from "../src/lib/server/session";

describe("session service", () => {
  it("creates random raw tokens and stable token hashes", () => {
    const first = createSessionToken();
    const second = createSessionToken();

    expect(first).not.toBe(second);
    expect(hashSessionToken(first)).toBe(hashSessionToken(first));
    expect(hashSessionToken(first)).not.toBe(first);
  });

  it("detects expired sessions", () => {
    expect(isSessionExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isSessionExpired(new Date(Date.now() + 1000))).toBe(false);
  });
});
