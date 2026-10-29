"use client";

import { PortalGate } from "@/components/shared/PortalStatus";
import { useBrandStore } from "@/features/brand/store";

export function BrandPortalGate({ children }: { children: React.ReactNode }) {
  const { status, error, retryHydration } = useBrandStore();

  return (
    <PortalGate status={status} error={error} onRetry={retryHydration}>
      {children}
    </PortalGate>
  );
}
