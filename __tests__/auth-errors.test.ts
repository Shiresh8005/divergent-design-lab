import { describe, it, expect } from "vitest";
import {
  formatAuthError,
  isEmailRateLimitError,
} from "@/lib/auth/errors";

describe("formatAuthError", () => {
  it("maps rate limit errors", () => {
    const msg = formatAuthError("email rate limit exceeded");
    expect(msg).toContain("Too many");
    expect(isEmailRateLimitError("email rate limit exceeded")).toBe(true);
  });

  it("maps invalid credentials", () => {
    expect(formatAuthError("Invalid login credentials")).toContain("Wrong email");
  });
});
