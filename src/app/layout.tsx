import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ourstory — Crowdfunding with Purpose",
  description:
    "An AI-enhanced crowdfunding platform that weaves individual acts of giving into a collective narrative.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
