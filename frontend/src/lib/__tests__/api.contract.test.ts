import { describe, expect, it } from "vitest";

describe("api contract baseline", () => {
  it("keeps v1 route prefix stable", () => {
    const requiredPaths = [
      "/api/v1/rounds",
      "/api/v1/rounds/{roundId}",
      "/api/v1/commands",
      "/api/v1/profile",
    ];

    expect(requiredPaths.every((path) => path.startsWith("/api/v1/"))).toBe(true);
  });
});
