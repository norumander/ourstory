import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateRegistration, hashPassword } from "@/lib/auth-utils";
import { compare } from "bcryptjs";

describe("validateRegistration", () => {
  it("returns null for valid input", () => {
    const result = validateRegistration({
      email: "test@example.com",
      password: "password123",
      displayName: "Test User",
    });
    expect(result).toBeNull();
  });

  it("rejects missing email", () => {
    const result = validateRegistration({
      email: "",
      password: "password123",
      displayName: "Test",
    });
    expect(result).toEqual({
      error: "Please enter a valid email address",
      field: "email",
    });
  });

  it("rejects invalid email format", () => {
    const result = validateRegistration({
      email: "not-an-email",
      password: "password123",
      displayName: "Test",
    });
    expect(result).toEqual({
      error: "Please enter a valid email address",
      field: "email",
    });
  });

  it("rejects password shorter than 8 characters", () => {
    const result = validateRegistration({
      email: "test@example.com",
      password: "short",
      displayName: "Test",
    });
    expect(result).toEqual({
      error: "Password must be at least 8 characters",
      field: "password",
    });
  });

  it("rejects empty display name", () => {
    const result = validateRegistration({
      email: "test@example.com",
      password: "password123",
      displayName: "",
    });
    expect(result).toEqual({
      error: "Display name is required",
      field: "displayName",
    });
  });

  it("rejects display name longer than 50 characters", () => {
    const result = validateRegistration({
      email: "test@example.com",
      password: "password123",
      displayName: "A".repeat(51),
    });
    expect(result).toEqual({
      error: "Display name must be 50 characters or fewer",
      field: "displayName",
    });
  });

  it("accepts display name of exactly 50 characters", () => {
    const result = validateRegistration({
      email: "test@example.com",
      password: "password123",
      displayName: "A".repeat(50),
    });
    expect(result).toBeNull();
  });

  it("accepts password of exactly 8 characters", () => {
    const result = validateRegistration({
      email: "test@example.com",
      password: "12345678",
      displayName: "Test",
    });
    expect(result).toBeNull();
  });
});

describe("hashPassword", () => {
  it("returns a bcrypt hash, not the original password", async () => {
    const password = "mysecretpassword";
    const hashed = await hashPassword(password);

    expect(hashed).not.toBe(password);
    expect(hashed).toMatch(/^\$2[aby]\$/); // bcrypt hash prefix
  });

  it("produces a hash that verifies against the original password", async () => {
    const password = "testpassword123";
    const hashed = await hashPassword(password);

    const isValid = await compare(password, hashed);
    expect(isValid).toBe(true);
  });

  it("produces a hash that does NOT verify against wrong password", async () => {
    const password = "correct-password";
    const hashed = await hashPassword(password);

    const isValid = await compare("wrong-password", hashed);
    expect(isValid).toBe(false);
  });

  it("uses bcrypt cost factor >= 10", async () => {
    const hashed = await hashPassword("test");
    // bcrypt hash format: $2b$COST$...
    const costStr = hashed.split("$")[2];
    const cost = parseInt(costStr, 10);
    expect(cost).toBeGreaterThanOrEqual(10);
  });
});
