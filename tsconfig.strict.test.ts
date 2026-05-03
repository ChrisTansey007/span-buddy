import { describe, it, expect } from "vitest"
// @vitest-environment node
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Guardrail test: tsconfig strictness cannot be quietly loosened.
 *
 * Loosening `strict`, `noUncheckedIndexedAccess`, or
 * `exactOptionalPropertyTypes` in a structural-sizing codebase is a
 * correctness risk — array-out-of-bounds in a span lookup is a real way to
 * silently ship wrong sizing. If this test starts failing, do not edit it;
 * edit tsconfig.json back to strict and figure out why strictness became
 * inconvenient.
 *
 * NOTE: tsconfig.json is currently pure JSON (no JSONC comments). If a
 * future change introduces // or /* comments, swap JSON.parse for a JSONC
 * parser (e.g. `jsonc-parser`) — do NOT try to strip comments with regex,
 * because the path alias `"@/*"` contains a `/*` token that naïve strippers
 * mangle into invalid JSON.
 */
describe("tsconfig strictness", () => {
  const raw = readFileSync(join(__dirname, "tsconfig.json"), "utf-8");
  // Strip UTF-8 BOM if present so JSON.parse doesn't trip on it.
  const normalized = raw.replace(/^\uFEFF/, "");
  const config = JSON.parse(normalized) as {
    compilerOptions?: Record<string, unknown>;
  };

  it("has strict: true", () => {
    expect(config.compilerOptions?.strict).toBe(true);
  });

  it("has noUncheckedIndexedAccess: true", () => {
    expect(config.compilerOptions?.noUncheckedIndexedAccess).toBe(true);
  });

  it("has exactOptionalPropertyTypes: true", () => {
    expect(config.compilerOptions?.exactOptionalPropertyTypes).toBe(true);
  });
});
