import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitsForTests } from "../src/lib/server/rate-limit";

describe("rate limiting", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it("blocks requests after the configured limit within the same window", () => {
    expect(checkRateLimit({ key: "ip:127.0.0.1", limit: 2, windowMs: 60_000, now: 1000 })).toEqual({
      allowed: true,
      remaining: 1,
    });
    expect(checkRateLimit({ key: "ip:127.0.0.1", limit: 2, windowMs: 60_000, now: 2000 })).toEqual({
      allowed: true,
      remaining: 0,
    });
    expect(checkRateLimit({ key: "ip:127.0.0.1", limit: 2, windowMs: 60_000, now: 3000 })).toEqual({
      allowed: false,
      remaining: 0,
    });
  });

  it("resets the request count after the window expires", () => {
    checkRateLimit({ key: "ip:127.0.0.1", limit: 1, windowMs: 60_000, now: 1000 });

    expect(checkRateLimit({ key: "ip:127.0.0.1", limit: 1, windowMs: 60_000, now: 62_000 })).toEqual({
      allowed: true,
      remaining: 0,
    });
  });
});
