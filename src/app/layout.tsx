import type { Metadata } from "next";
import { figtree } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creators — The new economy.",
  description: "Build businesses, run ads, get paid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
