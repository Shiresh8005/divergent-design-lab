import { describe, it, expect } from "vitest";
import { safeRedirectPath } from "@/lib/auth/redirect";

describe("safeRedirectPath", () => {
  it("returns fallback for null/undefined", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
  });

  it("allows safe relative paths", () => {
    expect(safeRedirectPath("/challenges")).toBe("/challenges");
    expect(safeRedirectPath("/challenges/uceed-2024")).toBe("/challenges/uceed-2024");
    expect(safeRedirectPath("/dashboard?tab=today")).toBe("/dashboard?tab=today");
  });

  it("blocks open redirects", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
  });
});
