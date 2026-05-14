import { describe, expect, it } from "vitest";
import { isDemoAuthEnabled } from "../src/lib/server/auth";

describe("demo authentication guard", () => {
  it("disables demo role switching in production", () => {
    expect(isDemoAuthEnabled("production")).toBe(false);
  });

  it("keeps demo role switching enabled outside production", () => {
    expect(isDemoAuthEnabled("development")).toBe(true);
    expect(isDemoAuthEnabled("test")).toBe(true);
  });
});
