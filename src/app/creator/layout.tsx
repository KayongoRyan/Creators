import { CreatorPortalGate } from "@/components/layout/CreatorPortalGate";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { creatorNav } from "@/config/navigation";
import { CreatorStoreProvider } from "@/features/creator/store";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Creator" role="creator" nav={creatorNav}>
      <CreatorStoreProvider>
        <CreatorPortalGate>{children}</CreatorPortalGate>
      </CreatorStoreProvider>
    </DashboardShell>
  );
}
