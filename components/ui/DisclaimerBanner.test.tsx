import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisclaimerBanner, DISCLAIMER_TEXT } from "./DisclaimerBanner";

describe("DisclaimerBanner", () => {
  it("renders the exact liability disclaimer text", () => {
    render(<DisclaimerBanner />);
    // Exact-string regression guard — if someone quietly edits the disclaimer,
    // this test fails loudly. The string is load-bearing legally.
    expect(screen.getByText(DISCLAIMER_TEXT)).toBeInTheDocument();
  });

  it("exposes the disclaimer as an accessible alert", () => {
    render(<DisclaimerBanner />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-label", "Engineering disclaimer");
    expect(alert).toHaveTextContent(DISCLAIMER_TEXT);
  });

  it("disclaimer text mentions the three non-negotiable claims", () => {
    // Defensive: even if the exact string changes (which requires an RFC),
    // these three claims must always be present.
    expect(DISCLAIMER_TEXT).toMatch(/preliminary/i);
    expect(DISCLAIMER_TEXT).toMatch(/licensed PE/);
    expect(DISCLAIMER_TEXT).toMatch(/stamp|seal/i);
  });
});
