import { BrandPortalGate } from "@/components/layout/BrandPortalGate";
import { WorkspaceMarketingShell } from "@/components/layout/WorkspaceMarketingShell";
import { brandNav } from "@/config/navigation";
import { BrandStoreProvider } from "@/features/brand/store";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceMarketingShell role="brand" nav={brandNav}>
      <BrandStoreProvider>
        <BrandPortalGate>{children}</BrandPortalGate>
      </BrandStoreProvider>
    </WorkspaceMarketingShell>
  );
}
