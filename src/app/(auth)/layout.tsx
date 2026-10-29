import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingThemeProvider>
      <SiteHeader />
      <main className="flex flex-1 flex-col bg-mkt-bg text-mkt-fg">{children}</main>
    </MarketingThemeProvider>
  );
}
