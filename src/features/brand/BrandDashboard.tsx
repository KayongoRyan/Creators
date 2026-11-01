"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkspaceHub } from "@/components/workspace/hub/WorkspaceHub";
import { BrandWorkspaceSummary } from "@/components/workspace/hub/BrandWorkspaceSummary";
import { isPortalGuest } from "@/features/auth/demoSession";
import { selectBrandDashboard, useBrandStore } from "@/features/brand/store";

export function BrandDashboard() {
  const { state } = useBrandStore();
  const metrics = selectBrandDashboard(state);
  const featured = state.campaigns.find((c) => c.status === "active");
  const pathname = usePathname();
  const [guest, setGuest] = useState(true);

  useEffect(() => {
    setGuest(isPortalGuest("brand"));
  }, [pathname]);

  const workspaceSummary = !guest ? (
    <BrandWorkspaceSummary
      brandName={state.brandName}
      activeCount={metrics.activeCount}
      assignedCreators={metrics.assigned}
      approvedPosts={metrics.approved}
      liveNotice={
        featured
          ? {
              title: featured.title,
              submitted: featured.submitted,
              assignedCreators: featured.assignedCreators,
            }
          : null
      }
      activeCampaigns={state.campaigns.filter((c) => c.status === "active")}
      latestPosts={featured?.posts.slice(0, 3) ?? []}
    />
  ) : null;

  return <WorkspaceHub variant="brand" guest={guest} afterHero={workspaceSummary} />;
}
