"use client";

import type { PortalLoadStatus } from "@/lib/portal/hydration";
import { siteConfig } from "@/config/site";

export function PortalLoadingState({ label = "Loading workspace…" }: { label?: string }) {
  return (
    <div
      className="mx-auto max-w-6xl py-16 text-center text-sm text-gray-600"
      role="status"
      aria-live="polite"
    >
      <p>{label}</p>
    </div>
  );
}

export function PortalErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="mx-auto max-w-6xl rounded-lg border border-red-200 bg-red-50 px-5 py-8 text-center"
      role="alert"
    >
      <p className="text-sm font-medium text-red-900">Could not load data</p>
      <p className="mt-2 text-sm text-red-800">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-red-300 bg-white px-4 text-sm font-medium text-red-900 hover:bg-red-50"
        >
          Retry
        </button>
      ) : null}
      {!siteConfig.useMockData ? (
        <p className="mt-4 text-xs text-red-700">
          Mock demo still works with{" "}
          <code className="rounded bg-red-100 px-1">NEXT_PUBLIC_USE_MOCK</code> unset
          or not <code className="rounded bg-red-100 px-1">0</code>.
        </p>
      ) : null}
    </div>
  );
}

export function PortalActionError({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div
      className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      role="status"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span>
          Saved locally, but the API call failed: {message}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs font-medium underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function PortalGate({
  status,
  error,
  onRetry,
  actionError,
  onDismissActionError,
  children,
}: {
  status: PortalLoadStatus;
  error: string | null;
  onRetry: () => void;
  actionError?: string | null;
  onDismissActionError?: () => void;
  children: React.ReactNode;
}) {
  if (status === "loading") {
    return <PortalLoadingState />;
  }
  if (status === "error" && error) {
    return <PortalErrorState message={error} onRetry={onRetry} />;
  }
  return (
    <>
      {actionError && onDismissActionError ? (
        <PortalActionError message={actionError} onDismiss={onDismissActionError} />
      ) : null}
      {children}
    </>
  );
}
