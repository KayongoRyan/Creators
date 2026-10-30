import type { Metadata, Viewport } from "next";
import { figtree } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creators — The new economy.",
  description: "Build businesses, run ads, get paid.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={figtree.variable}
      data-marketing-theme="light"
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.setAttribute("data-marketing-theme","light");document.documentElement.style.colorScheme="light";localStorage.setItem("creators-marketing-theme","light");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
