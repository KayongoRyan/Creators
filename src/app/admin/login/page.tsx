import { AdminAuthHeader } from "@/components/marketing/AdminAuthHeader";
import { MarketingThemeProvider } from "@/components/marketing/MarketingThemeProvider";
import { AdminLoginForm } from "@/features/auth/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <MarketingThemeProvider>
      <div className="flex min-h-screen flex-col bg-mkt-bg text-mkt-fg">
        <AdminAuthHeader />
        <main className="flex flex-1 flex-col">
          <AdminLoginForm />
        </main>
      </div>
    </MarketingThemeProvider>
  );
}
