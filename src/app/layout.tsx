import type { Metadata } from "next";
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
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
