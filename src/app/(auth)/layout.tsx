import { SiteHeader } from "@/components/marketing/SiteHeader";
import { marketingShell } from "@/lib/marketing";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${marketingShell} flex min-h-screen flex-col`}>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
