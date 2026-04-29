import type { Metadata } from "next";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Span Buddy",
  description:
    "Residential beam and floor joist sizing calculator — IRC 2021 prescriptive tables. Preliminary sizing aid only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <DisclaimerBanner />
        <main className="flex min-h-[calc(100dvh-40px)] flex-col items-center justify-center p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
