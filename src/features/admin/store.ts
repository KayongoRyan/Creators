"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { siteConfig } from "@/config/site";
import { readDemoSession } from "@/features/auth/demoSession";
import { adminSeed } from "@/lib/api/fixtures";
import {
  PLATFORM_EVENTS_UPDATE,
  readPlatformEvents,
  recordPlatformEvent,
} from "@/lib/analytics/platformEvents";
import { severityForAction } from "@/lib/analytics/seed";
import {
  apiApproveSubmission,
  apiCreateCampaign,
  apiMarkAllPayoutsPaid,
  apiMarkPayoutPaid,
  apiRejectCreator,
  apiRejectSubmission,
  apiRequestRevision,
  apiVerifyCreator,
  fetchAdminState,
} from "@/lib/api/portalApi";
import {
  hydrateFromApi,
  runApiMutation,
  type PortalLoadStatus,
} from "@/lib/portal/hydration";
import type {
  AdminActivityEvent,
  AdminState,
  AdminSubmission,
  AuditAction,
  AuditEvent,
  BrandAccountStatus,
  Campaign,
  CreateCampaignInput,
  CreatorApplication,
  PayoutRecord,
} from "@/types";

const STORAGE_KEY = "creators_admin_state_v1";

function normalizeState(partial: Partial<AdminState>): AdminState {
  const seed = structuredClone(adminSeed);
  // In mock mode the analytics series and audit seed are regenerated relative
  // to today, so always use the fresh seed. Live activity is merged from the
  // shared platform event log. In API mode, prefer server-provided data.
  const useSeedAnalytics =
    siteConfig.useMockData || !partial.analytics?.daily?.length;
  return {
    ...seed,
    ...partial,
    brandAccounts: partial.brandAccounts?.length
      ? partial.brandAccounts
      : seed.brandAccounts,
    activityLog: partial.activityLog?.length ? partial.activityLog : seed.activityLog,
    analytics: useSeedAnalytics ? seed.analytics : partial.analytics!,
    auditLog:
      siteConfig.useMockData || !Array.isArray(partial.auditLog)
        ? seed.auditLog
        : partial.auditLog,
  };
}

function readState(): AdminState {
  if (typeof window === "undefined") {
    return structuredClone(adminSeed);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(adminSeed);
    return normalizeState(JSON.parse(raw) as Partial<AdminState>);
  } catch {
    return structuredClone(adminSeed);
  }
}

function appendActivity(
  state: AdminState,
  event: Omit<AdminActivityEvent, "id">,
): AdminState {
  const entry: AdminActivityEvent = {
    ...event,
    id: nextId("act"),
  };
  return {
    ...state,
    activityLog: [entry, ...state.activityLog].slice(0, 80),
  };
}

function writeState(state: AdminState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("admin-store-updated"));
}

export function resetAdminStore() {
  writeState(structuredClone(adminSeed));
}

export type { CreateCampaignInput };

function nextId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}`;
}

function logAdminAction(input: {
  action: AuditAction;
  summary: string;
  targetLabel?: string;
  href?: string;
  source?: string;
}) {
  recordPlatformEvent({
    ...input,
    actorName: readDemoSession()?.displayName ?? "Admin",
    actorRole: "admin",
    severity: severityForAction(input.action),
    source: input.source ?? "/admin",
  });
}

export type AdminStoreValue = ReturnType<typeof useAdminStoreController>;

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const value = useAdminStoreController();
  return createElement(AdminStoreContext.Provider, { value }, children);
}

export function useAdminStore() {
  const value = useContext(AdminStoreContext);
  if (!value) {
    throw new Error("useAdminStore must be used within AdminStoreProvider");
  }
  return value;
}

function useAdminStoreController() {
  const [state, setState] = useState<AdminState>(() => readState());
  const [status, setStatus] = useState<PortalLoadStatus>(() =>
    siteConfig.useMockData ? "ready" : "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<AuditEvent[]>([]);

  const hydrate = useCallback(async () => {
    if (siteConfig.useMockData) {
      setState(readState());
      setStatus("ready");
      setError(null);
      return;
    }
    setStatus("loading");
    setError(null);
    const result = await hydrateFromApi(fetchAdminState, (state) =>
      writeState(normalizeState(state)),
    );
    if (result.ok) {
      setState(normalizeState(result.data));
      setStatus("ready");
      return;
    }
    setState(readState());
    setError(result.error);
    setStatus("error");
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const sync = () => setState(readState());
    window.addEventListener("admin-store-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("admin-store-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const sync = () => setLiveEvents(readPlatformEvents());
    sync();
    window.addEventListener(PLATFORM_EVENTS_UPDATE, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PLATFORM_EVENTS_UPDATE, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const persist = useCallback((updater: (prev: AdminState) => AdminState) => {
    setState((prev) => {
      const next = updater(prev);
      writeState(next);
      return next;
    });
  }, []);

  const notifyMutationFailure = useCallback(async (mutation: () => Promise<void>) => {
    const result = await runApiMutation(mutation);
    if (!result.ok) setActionError(result.error);
  }, []);

  const createCampaign = useCallback(
    (input: CreateCampaignInput) => {
      const campaign: Campaign = {
        id: nextId("cmp"),
        brandId: nextId("br"),
        title: input.title.trim(),
        brandName: input.brandName.trim(),
        campaignType: input.campaignType.trim(),
        status: "draft",
        budgetCents: Math.round(input.budgetRwf * 100),
        deadline: input.deadline,
        feePercent: 20,
        assignedCreators: 0,
        submissionsReceived: 0,
        submissionsApproved: 0,
        createdAt: new Date().toISOString(),
      };
      persist((s) =>
        appendActivity(
          { ...s, campaigns: [campaign, ...s.campaigns] },
          {
            at: new Date().toISOString(),
            kind: "campaign_created",
            actorLabel: input.brandName.trim(),
            summary: `New campaign draft: ${input.title.trim()}`,
            href: "/admin/campaigns",
          },
        ),
      );
      void notifyMutationFailure(() => apiCreateCampaign(input));
      logAdminAction({
        action: "campaign_created",
        summary: `Created campaign draft · ${campaign.title}`,
        targetLabel: campaign.brandName,
        href: "/admin/campaigns",
        source: "/admin/campaigns",
      });
      return campaign;
    },
    [notifyMutationFailure, persist],
  );

  const verifyCreator = useCallback(
    (applicationId: string) => {
      const application = state.creatorApplications.find(
        (a) => a.id === applicationId,
      );
      persist((s) => {
        const app = s.creatorApplications.find((a) => a.id === applicationId);
        if (!app || app.status !== "pending") return s;

        const updatedApps = s.creatorApplications.map((a) =>
          a.id === applicationId ? { ...a, status: "verified" as const } : a,
        );

        const verified: typeof s.verifiedCreators[0] = {
          id: nextId("cr"),
          displayName: app.fullName,
          handle: `${app.tiktokHandle} · TikTok ${formatFollowers(app.tiktokFollowers)}`,
          campaignsCompleted: 0,
          label: "New",
        };

        const next = {
          ...s,
          creatorApplications: updatedApps.filter((a) => a.status === "pending"),
          verifiedCreators: [verified, ...s.verifiedCreators],
        };
        return appendActivity(next, {
          at: new Date().toISOString(),
          kind: "creator_verified",
          actorLabel: app.fullName,
          summary: "Creator verified and added to roster",
          href: "/admin/creators",
        });
      });
      void notifyMutationFailure(() => apiVerifyCreator(applicationId));
      logAdminAction({
        action: "creator_approved",
        summary: application
          ? `Verified ${application.fullName} and added them to the roster`
          : "Verified a creator application",
        targetLabel: application?.fullName,
        href: "/admin/creators",
        source: "/admin/creators",
      });
    },
    [notifyMutationFailure, persist, state.creatorApplications],
  );

  const rejectCreator = useCallback(
    (applicationId: string) => {
      const application = state.creatorApplications.find(
        (a) => a.id === applicationId,
      );
      persist((s) => {
        const app = s.creatorApplications.find((a) => a.id === applicationId);
        const next = {
          ...s,
          creatorApplications: s.creatorApplications.filter(
            (a) => a.id !== applicationId,
          ),
        };
        if (!app) return next;
        return appendActivity(next, {
          at: new Date().toISOString(),
          kind: "creator_rejected",
          actorLabel: app.fullName,
          summary: "Creator application rejected",
          href: "/admin/creators",
        });
      });
      void notifyMutationFailure(() => apiRejectCreator(applicationId));
      logAdminAction({
        action: "creator_rejected",
        summary: application
          ? `Rejected ${application.fullName}'s creator application`
          : "Rejected a creator application",
        targetLabel: application?.fullName,
        href: "/admin/creators",
        source: "/admin/creators",
      });
    },
    [notifyMutationFailure, persist, state.creatorApplications],
  );

  const approveSubmission = useCallback(
    (submissionId: string) => {
      const submission = state.submissions.find((x) => x.id === submissionId);
      persist((s) => {
        const sub = s.submissions.find((x) => x.id === submissionId);
        let next = updateSubmission(s, submissionId, { status: "approved" });
        if (sub) {
          next = appendActivity(next, {
            at: new Date().toISOString(),
            kind: "submission_approved",
            actorLabel: sub.creatorName,
            summary: `Approved · ${sub.campaignTitle}`,
            href: "/admin/submissions",
          });
        }
        return next;
      });
      void notifyMutationFailure(() => apiApproveSubmission(submissionId));
      logAdminAction({
        action: "submission_approved",
        summary: submission
          ? `Approved ${submission.creatorName}'s submission · ${submission.campaignTitle}`
          : "Approved a submission",
        targetLabel: submission?.campaignTitle,
        href: "/admin/submissions",
        source: "/admin/submissions",
      });
    },
    [notifyMutationFailure, persist, state.submissions],
  );

  const rejectSubmission = useCallback(
    (submissionId: string) => {
      const submission = state.submissions.find((x) => x.id === submissionId);
      persist((s) => {
        const sub = s.submissions.find((x) => x.id === submissionId);
        let next = updateSubmission(s, submissionId, { status: "rejected" });
        if (sub) {
          next = appendActivity(next, {
            at: new Date().toISOString(),
            kind: "submission_rejected",
            actorLabel: sub.creatorName,
            summary: `Rejected · ${sub.campaignTitle}`,
            href: "/admin/submissions",
          });
        }
        return next;
      });
      void notifyMutationFailure(() => apiRejectSubmission(submissionId));
      logAdminAction({
        action: "submission_rejected",
        summary: submission
          ? `Rejected ${submission.creatorName}'s submission · ${submission.campaignTitle}`
          : "Rejected a submission",
        targetLabel: submission?.campaignTitle,
        href: "/admin/submissions",
        source: "/admin/submissions",
      });
    },
    [notifyMutationFailure, persist, state.submissions],
  );

  const requestRevision = useCallback(
    (submissionId: string, revisionNote: string) => {
      const note = revisionNote.trim();
      const submission = state.submissions.find((x) => x.id === submissionId);
      persist((s) => {
        const sub = s.submissions.find((x) => x.id === submissionId);
        let next = updateSubmission(s, submissionId, {
          status: "revision",
          revisionNote: note,
        });
        if (sub) {
          next = appendActivity(next, {
            at: new Date().toISOString(),
            kind: "submission_revision",
            actorLabel: sub.creatorName,
            summary: `Revision requested · ${sub.campaignTitle}`,
            href: "/admin/submissions",
          });
        }
        return next;
      });
      void notifyMutationFailure(() =>
        apiRequestRevision(submissionId, note),
      );
      logAdminAction({
        action: "submission_revision",
        summary: submission
          ? `Requested a revision from ${submission.creatorName} · ${submission.campaignTitle}`
          : "Requested a submission revision",
        targetLabel: submission?.campaignTitle,
        href: "/admin/submissions",
        source: "/admin/submissions",
      });
    },
    [notifyMutationFailure, persist, state.submissions],
  );

  const markPayoutPaid = useCallback(
    (payoutId: string) => {
      const payout = state.payouts.find((p) => p.id === payoutId);
      persist((s) => ({
        ...s,
        payouts: s.payouts.map((p) =>
          p.id === payoutId ? { ...p, status: "paid" as const } : p,
        ),
      }));
      void notifyMutationFailure(() => apiMarkPayoutPaid(payoutId));
      logAdminAction({
        action: "payout_paid",
        summary: payout
          ? `Paid RWF ${payout.amountRwf.toLocaleString("en-US")} to ${payout.creatorName} via MoMo`
          : "Marked a payout as paid",
        targetLabel: payout?.creatorName,
        href: "/admin/payments",
        source: "/admin/payments",
      });
    },
    [notifyMutationFailure, persist, state.payouts],
  );

  const markAllDuePayoutsPaid = useCallback(() => {
    const pending = state.payouts.filter((p) => p.status === "pending");
    const total = pending.reduce((sum, p) => sum + p.amountRwf, 0);
    persist((s) => {
      const count = s.payouts.filter((p) => p.status === "pending").length;
      const next = {
        ...s,
        payouts: s.payouts.map((p) =>
          p.status === "pending" ? { ...p, status: "paid" as const } : p,
        ),
      };
      if (count === 0) return next;
      return appendActivity(next, {
        at: new Date().toISOString(),
        kind: "payout_paid",
        actorLabel: "Finance",
        summary: `Marked ${count} payout${count === 1 ? "" : "s"} as paid via MoMo`,
        href: "/admin/payments",
      });
    });
    void notifyMutationFailure(() => apiMarkAllPayoutsPaid());
    if (pending.length > 0) {
      logAdminAction({
        action: "payout_batch_paid",
        summary: `Marked ${pending.length} payout${pending.length === 1 ? "" : "s"} as paid via MoMo · RWF ${total.toLocaleString("en-US")}`,
        targetLabel: "Finance",
        href: "/admin/payments",
        source: "/admin/payments",
      });
    }
  }, [notifyMutationFailure, persist, state.payouts]);

  const setBrandStatus = useCallback(
    (brandId: string, status: BrandAccountStatus) => {
      const brand = state.brandAccounts.find((b) => b.id === brandId);
      persist((s) => {
        const brand = s.brandAccounts.find((b) => b.id === brandId);
        if (!brand || brand.status === status) return s;
        const brandAccounts = s.brandAccounts.map((b) =>
          b.id === brandId ? { ...b, status, lastActiveAt: new Date().toISOString() } : b,
        );
        return appendActivity(
          { ...s, brandAccounts },
          {
            at: new Date().toISOString(),
            kind: "brand_status",
            actorLabel: brand.name,
            summary: `Brand status → ${status.replace("_", " ")}`,
            href: "/admin/brands",
          },
        );
      });
      logAdminAction({
        action: "brand_status_updated",
        summary: brand
          ? `Changed ${brand.name} status to ${status.replace("_", " ")}`
          : "Updated a business account status",
        targetLabel: brand?.name,
        href: "/admin/brands",
        source: "/admin/brands",
      });
    },
    [persist, state.brandAccounts],
  );

  const setCreatorSuspended = useCallback(
    (creatorId: string, suspended: boolean) => {
      const actor = state.verifiedCreators.find((c) => c.id === creatorId);
      persist((s) => {
        const creator = s.verifiedCreators.find((c) => c.id === creatorId);
        if (!creator) return s;
        const verifiedCreators = s.verifiedCreators.map((c) =>
          c.id === creatorId
            ? { ...c, status: suspended ? ("suspended" as const) : ("active" as const) }
            : c,
        );
        return appendActivity(
          { ...s, verifiedCreators },
          {
            at: new Date().toISOString(),
            kind: suspended ? "creator_suspended" : "creator_reactivated",
            actorLabel: creator.displayName,
            summary: suspended
              ? "Creator suspended from new assignments"
              : "Creator reactivated on platform",
            href: "/admin/creators",
          },
        );
      });
      logAdminAction({
        action: suspended ? "creator_suspended" : "creator_reactivated",
        summary: actor
          ? suspended
            ? `Suspended ${actor.displayName} from new assignments`
            : `Reactivated ${actor.displayName} on the platform`
          : suspended
            ? "Suspended a creator"
            : "Reactivated a creator",
        targetLabel: actor?.displayName,
        href: "/admin/creators",
        source: "/admin/creators",
      });
    },
    [persist, state.verifiedCreators],
  );

  return {
    state,
    status,
    error,
    actionError,
    liveEvents,
    retryHydration: hydrate,
    clearActionError: () => setActionError(null),
    createCampaign,
    verifyCreator,
    rejectCreator,
    approveSubmission,
    rejectSubmission,
    requestRevision,
    markPayoutPaid,
    markAllDuePayoutsPaid,
    setBrandStatus,
    setCreatorSuspended,
  };
}

function updateSubmission(
  s: AdminState,
  submissionId: string,
  patch: Partial<AdminSubmission>,
): AdminState {
  const submissions = s.submissions.map((sub) =>
    sub.id === submissionId ? { ...sub, ...patch } : sub,
  );
  return { ...s, submissions };
}

function formatFollowers(n: number) {
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

export function selectOverviewMetrics(state: AdminState) {
  const activeCampaigns = state.campaigns.filter((c) => c.status === "active")
    .length;
  const vettedCreators = state.verifiedCreators.length;
  const pendingApplications = state.creatorApplications.filter(
    (a) => a.status === "pending",
  ).length;
  const pendingSubmissions = state.submissions.filter(
    (s) => s.status === "pending",
  ).length;
  const payoutsDueRwf = state.payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amountRwf, 0);
  const collectedRwf = state.brandCollections
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.amountRwf, 0);

  const activeBrands = state.brandAccounts.filter((b) => b.status === "active").length;
  const suspendedCreators = state.verifiedCreators.filter(
    (c) => c.status === "suspended",
  ).length;

  return {
    activeCampaigns,
    vettedCreators,
    activeBrands,
    suspendedCreators,
    pendingApplications,
    pendingSubmissions,
    payoutsDueRwf,
    collectedRwf,
    totalBrands: state.brandAccounts.length,
  };
}

export function selectActivityFeed(state: AdminState, limit = 12): AdminActivityEvent[] {
  return state.activityLog.slice(0, limit);
}

export function selectBrandAccounts(state: AdminState) {
  return state.brandAccounts;
}

export function selectPendingPayouts(state: AdminState): PayoutRecord[] {
  return state.payouts.filter((p) => p.status === "pending");
}

export function selectPendingApplications(
  state: AdminState,
): CreatorApplication[] {
  return state.creatorApplications.filter((a) => a.status === "pending");
}
