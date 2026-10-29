import { BrandPortalGate } from "@/components/layout/BrandPortalGate";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { brandNav } from "@/config/navigation";
import { BrandStoreProvider } from "@/features/brand/store";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Brand portal" role="brand" nav={brandNav}>
      <BrandStoreProvider>
        <BrandPortalGate>{children}</BrandPortalGate>
      </BrandStoreProvider>
    </DashboardShell>
  );
}
