import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatDate,
  calculateProgress,
  deriveUsername,
  getInitials,
} from "@/lib/utils";

describe("cn", () => {
  it("joins class names with spaces", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("returns empty string for no valid classes", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats cents as dollars with no decimals", () => {
    expect(formatCurrency(100)).toBe("$1");
    expect(formatCurrency(12345)).toBe("$123");
    expect(formatCurrency(123456)).toBe("$1,235");
  });

  it("formats zero cents", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats large amounts", () => {
    expect(formatCurrency(100000000)).toBe("$1,000,000");
  });
});

describe("formatDate", () => {
  it("formats Date object", () => {
    const result = formatDate(new Date("2026-01-15"));
    expect(result).toContain("Jan");
    expect(result).toContain("2026");
  });

  it("formats ISO string", () => {
    const result = formatDate("2026-06-20T12:00:00Z");
    expect(result).toContain("Jun");
    expect(result).toContain("2026");
  });
});

describe("calculateProgress", () => {
  it("calculates percentage correctly", () => {
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(75, 100)).toBe(75);
  });

  it("clamps to 100 when raised exceeds goal", () => {
    expect(calculateProgress(150, 100)).toBe(100);
  });

  it("returns 0 for zero goal", () => {
    expect(calculateProgress(50, 0)).toBe(0);
  });

  it("returns 0 for negative goal", () => {
    expect(calculateProgress(50, -10)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    expect(calculateProgress(33, 100)).toBe(33);
    expect(calculateProgress(1, 3)).toBe(33);
  });
});

describe("deriveUsername", () => {
  it("extracts prefix before @ and lowercases", () => {
    expect(deriveUsername("John@example.com")).toBe("john");
  });

  it("handles email with dots and numbers", () => {
    expect(deriveUsername("john.doe2024@gmail.com")).toBe("john.doe2024");
  });

  it("handles already lowercase email", () => {
    expect(deriveUsername("demo@ourstory.app")).toBe("demo");
  });
});

describe("getInitials", () => {
  it("returns first letter for single name", () => {
    expect(getInitials("Norman")).toBe("N");
  });

  it("returns first and last initials for two names", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns first and last initials for three names", () => {
    expect(getInitials("John Michael Doe")).toBe("JD");
  });

  it("handles extra whitespace", () => {
    expect(getInitials("  Jane   Doe  ")).toBe("JD");
  });
});
