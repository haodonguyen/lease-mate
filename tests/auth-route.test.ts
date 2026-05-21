import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "../src/app/api/auth/login/route";
import { POST as SIGNUP_POST } from "../src/app/api/auth/signup/route";
import { resetRateLimitsForTests } from "../src/lib/server/rate-limit";

describe("login route", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it("rate limits repeated login attempts from the same client", async () => {
    const request = () =>
      new Request("https://leasemate.test/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.10",
        },
        body: JSON.stringify({ email: "owner@leasemate.dev", password: "short" }),
      });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await POST(request());
      expect(response.status).toBe(400);
    }

    const blocked = await POST(request());
    expect(blocked.status).toBe(429);
  });
});

describe("signup route", () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it("rate limits repeated invalid signup attempts from the same client", async () => {
    const request = () =>
      new Request("https://leasemate.test/api/auth/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.11",
        },
        body: JSON.stringify({
          name: "A",
          email: "bad",
          password: "short",
          role: "ADMIN",
          acceptedTerms: false,
        }),
      });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await SIGNUP_POST(request());
      expect(response.status).toBe(400);
    }

    const blocked = await SIGNUP_POST(request());
    expect(blocked.status).toBe(429);
  });
});
