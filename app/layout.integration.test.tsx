// Approach (a): renderRootLayout using renderToStaticMarkup from react-dom/server because it avoids mounting nested html/body elements in jsdom and allows simpler HTML string assertions.

import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "@/app/layout";
import Home from "@/app/page";
import NotFound from "@/app/not-found";
import { DISCLAIMER_TEXT } from "@/components/ui/DisclaimerBanner";

/**
 * Integration tests for RootLayout ensuring DisclaimerBanner mounts correctly
 * and page content is rendered alongside it.
 */

test("RootLayout with Home renders DisclaimerBanner", async () => {
  const html = renderToStaticMarkup(<RootLayout children={<Home />} />);
  expect(html).toContain(DISCLAIMER_TEXT);
});

test("RootLayout with Home renders home heading", async () => {
  const html = renderToStaticMarkup(<RootLayout children={<Home />} />);
  expect(html).toContain("Hello, Span Buddy");
});

test("RootLayout with NotFound renders DisclaimerBanner", async () => {
  const html = renderToStaticMarkup(<RootLayout children={<NotFound />} />);
  expect(html).toContain(DISCLAIMER_TEXT);
});
