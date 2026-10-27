import { DashboardShell } from "@/components/layout/DashboardShell";
import { brandNav } from "@/config/navigation";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Brand" nav={brandNav}>
      {children}
    </DashboardShell>
  );
}
