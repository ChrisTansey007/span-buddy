/**
 * DisclaimerBanner — legal / liability guard.
 *
 * This component is **non-negotiable UI**. Every page that exposes engine output
 * (sizing results) must render it. The exact string is regression-tested:
 * see components/ui/DisclaimerBanner.test.tsx and tests/e2e/landing.spec.ts.
 *
 * Do not alter the text without a corresponding RFC.
 */
export const DISCLAIMER_TEXT =
  "Preliminary sizing aid. Verify with a licensed PE before construction. This tool does not stamp or seal engineering work.";

export function DisclaimerBanner(): React.ReactNode {
  return (
    <div
      role="alert"
      aria-label="Engineering disclaimer"
      className="w-full border-b border-amber-400 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900"
    >
      {DISCLAIMER_TEXT}
    </div>
  );
}