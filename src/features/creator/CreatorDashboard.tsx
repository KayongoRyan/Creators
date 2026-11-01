"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkspaceHub } from "@/components/workspace/hub/WorkspaceHub";
import { CreatorWorkspaceSummary } from "@/components/workspace/hub/CreatorWorkspaceSummary";
import { isPortalGuest } from "@/features/auth/demoSession";
import { selectCreatorDashboard, useCreatorStore } from "@/features/creator/store";

export function CreatorDashboard() {
  const { state } = useCreatorStore();
  const metrics = selectCreatorDashboard(state);
  const approvedAssignment = state.assignments.find((a) => a.status === "approved");
  const [guest, setGuest] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
    setGuest(isPortalGuest("creator"));
  }, [pathname]);

  const actionTasks = state.assignments.filter(
    (a) => a.status === "not_submitted" || a.status === "revision",
  );

  const workspaceSummary = !guest ? (
    <CreatorWorkspaceSummary
      displayName={state.profile.displayName}
      approvedRwf={metrics.approvedRwf}
      pendingRwf={metrics.pendingRwf}
      campaignsCompleted={state.profile.campaignsCompleted}
      approvedNotice={approvedAssignment ? { payoutRwf: approvedAssignment.payoutRwf } : null}
      actionTasks={actionTasks}
    />
  ) : null;

  return <WorkspaceHub variant="creator" guest={guest} afterHero={workspaceSummary} />;
}
