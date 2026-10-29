import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingThemeProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </MarketingThemeProvider>
  );
}
