import { CreatorPortalGate } from "@/components/layout/CreatorPortalGate";
import { WorkspaceMarketingShell } from "@/components/layout/WorkspaceMarketingShell";
import { creatorNav } from "@/config/navigation";
import { CreatorStoreProvider } from "@/features/creator/store";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceMarketingShell role="creator" nav={creatorNav}>
      <CreatorStoreProvider>
        <CreatorPortalGate>{children}</CreatorPortalGate>
      </CreatorStoreProvider>
    </WorkspaceMarketingShell>
  );
}
