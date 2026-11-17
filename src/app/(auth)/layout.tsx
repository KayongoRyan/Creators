import { AdminAuthHeader } from "@/components/marketing/AdminAuthHeader";
import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { isAdminOnlyPortal } from "@/lib/portal/devScope";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminPortal = isAdminOnlyPortal();

  return (
    <MarketingThemeProvider>
      {adminPortal ? <AdminAuthHeader /> : <SiteHeader />}
      <main className="flex flex-1 flex-col bg-mkt-bg text-mkt-fg">{children}</main>
    </MarketingThemeProvider>
  );
}
