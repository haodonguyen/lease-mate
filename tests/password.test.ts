import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/server/password";

describe("password utilities", () => {
  it("hashes a password without storing the plain text", async () => {
    const hash = await hashPassword("LeaseMate123!");

    expect(hash).not.toBe("LeaseMate123!");
    expect(hash).toMatch(/^scrypt:/);
  });

  it("verifies matching passwords and rejects wrong passwords", async () => {
    const hash = await hashPassword("LeaseMate123!");

    await expect(verifyPassword("LeaseMate123!", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
