import { describe, it, expect } from "vitest";

describe("engine sanity", () => {
  it("confirms the test runner is wired", () => {
    expect(2 + 2).toBe(4);
  });

  it("confirms strict-mode array access returns T | undefined", () => {
    // noUncheckedIndexedAccess makes xs[0] typed as number | undefined.
    // This test documents the intent — typecheck (tsc --noEmit) is the real
    // guard; this body only runs at test time to prove the shape at runtime.
    const xs: number[] = [1, 2, 3];
    const first = xs[0];
    expect(first).toBe(1);
  });
});
