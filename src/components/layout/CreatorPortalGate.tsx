"use client";

import { PortalGate } from "@/components/shared/PortalStatus";
import { useCreatorStore } from "@/features/creator/store";

export function CreatorPortalGate({ children }: { children: React.ReactNode }) {
  const {
    status,
    error,
    actionError,
    retryHydration,
    clearActionError,
  } = useCreatorStore();

  return (
    <PortalGate
      status={status}
      error={error}
      onRetry={retryHydration}
      actionError={actionError}
      onDismissActionError={clearActionError}
    >
      {children}
    </PortalGate>
  );
}
