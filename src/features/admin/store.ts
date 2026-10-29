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
import { adminSeed } from "@/lib/api/fixtures";
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
  AdminState,
  AdminSubmission,
  Campaign,
  CreateCampaignInput,
  CreatorApplication,
  PayoutRecord,
} from "@/types";

const STORAGE_KEY = "creators_admin_state_v1";

function readState(): AdminState {
  if (typeof window === "undefined") {
    return adminSeed;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(adminSeed);
    return JSON.parse(raw) as AdminState;
  } catch {
    return structuredClone(adminSeed);
  }
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

  const hydrate = useCallback(async () => {
    if (siteConfig.useMockData) {
      setState(readState());
      setStatus("ready");
      setError(null);
      return;
    }
    setStatus("loading");
    setError(null);
    const result = await hydrateFromApi(fetchAdminState, writeState);
    if (result.ok) {
      setState(result.data);
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
      persist((s) => ({ ...s, campaigns: [campaign, ...s.campaigns] }));
      void notifyMutationFailure(() => apiCreateCampaign(input));
      return campaign;
    },
    [notifyMutationFailure, persist],
  );

  const verifyCreator = useCallback(
    (applicationId: string) => {
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

        return {
          ...s,
          creatorApplications: updatedApps.filter((a) => a.status === "pending"),
          verifiedCreators: [verified, ...s.verifiedCreators],
        };
      });
      void notifyMutationFailure(() => apiVerifyCreator(applicationId));
    },
    [notifyMutationFailure, persist],
  );

  const rejectCreator = useCallback(
    (applicationId: string) => {
      persist((s) => ({
        ...s,
        creatorApplications: s.creatorApplications.filter(
          (a) => a.id !== applicationId,
        ),
      }));
      void notifyMutationFailure(() => apiRejectCreator(applicationId));
    },
    [notifyMutationFailure, persist],
  );

  const approveSubmission = useCallback(
    (submissionId: string) => {
      persist((s) => updateSubmission(s, submissionId, { status: "approved" }));
      void notifyMutationFailure(() => apiApproveSubmission(submissionId));
    },
    [notifyMutationFailure, persist],
  );

  const rejectSubmission = useCallback(
    (submissionId: string) => {
      persist((s) => updateSubmission(s, submissionId, { status: "rejected" }));
      void notifyMutationFailure(() => apiRejectSubmission(submissionId));
    },
    [notifyMutationFailure, persist],
  );

  const requestRevision = useCallback(
    (submissionId: string, revisionNote: string) => {
      const note = revisionNote.trim();
      persist((s) =>
        updateSubmission(s, submissionId, {
          status: "revision",
          revisionNote: note,
        }),
      );
      void notifyMutationFailure(() =>
        apiRequestRevision(submissionId, note),
      );
    },
    [notifyMutationFailure, persist],
  );

  const markPayoutPaid = useCallback(
    (payoutId: string) => {
      persist((s) => ({
        ...s,
        payouts: s.payouts.map((p) =>
          p.id === payoutId ? { ...p, status: "paid" as const } : p,
        ),
      }));
      void notifyMutationFailure(() => apiMarkPayoutPaid(payoutId));
    },
    [notifyMutationFailure, persist],
  );

  const markAllDuePayoutsPaid = useCallback(() => {
    persist((s) => ({
      ...s,
      payouts: s.payouts.map((p) =>
        p.status === "pending" ? { ...p, status: "paid" as const } : p,
      ),
    }));
    void notifyMutationFailure(() => apiMarkAllPayoutsPaid());
  }, [notifyMutationFailure, persist]);

  return {
    state,
    status,
    error,
    actionError,
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

  return {
    activeCampaigns,
    vettedCreators,
    pendingApplications,
    pendingSubmissions,
    payoutsDueRwf,
    collectedRwf,
  };
}

export function selectPendingPayouts(state: AdminState): PayoutRecord[] {
  return state.payouts.filter((p) => p.status === "pending");
}

export function selectPendingApplications(
  state: AdminState,
): CreatorApplication[] {
  return state.creatorApplications.filter((a) => a.status === "pending");
}
