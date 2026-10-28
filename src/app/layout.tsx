import type { Metadata } from "next";
import { figtree } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creators",
  description:
    "Brands post campaigns. Creators apply. Submissions come back for review.",
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
