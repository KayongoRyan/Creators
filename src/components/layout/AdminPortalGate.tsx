"use client";

import { PortalGate } from "@/components/shared/PortalStatus";
import { useAdminStore } from "@/features/admin/store";

export function AdminPortalGate({ children }: { children: React.ReactNode }) {
  const { status, error, actionError, retryHydration, clearActionError } =
    useAdminStore();

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
