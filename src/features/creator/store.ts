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
import { recordPlatformEvent } from "@/lib/analytics/platformEvents";
import { severityForAction } from "@/lib/analytics/seed";
import {
  apiApplyToCampaign,
  apiSubmitAssignment,
  apiUpdateCreatorProfile,
  fetchCreatorState,
} from "@/lib/api/portalApi";
import {
  hydrateFromApi,
  runApiMutation,
  type PortalLoadStatus,
} from "@/lib/portal/hydration";
import { creatorSeed } from "@/lib/portalSeeds";
import type {
  CampaignApplication,
  CreatorAssignment,
  CreatorProfile,
  CreatorState,
} from "@/types";

const STORAGE_KEY = "creators_creator_state_v1";

function readState(): CreatorState {
  if (typeof window === "undefined") return creatorSeed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(creatorSeed);
    return JSON.parse(raw) as CreatorState;
  } catch {
    return structuredClone(creatorSeed);
  }
}

function writeState(state: CreatorState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("creator-store-updated"));
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}`;
}

type CreatorStoreValue = ReturnType<typeof useCreatorStoreController>;

const CreatorStoreContext = createContext<CreatorStoreValue | null>(null);

export function CreatorStoreProvider({ children }: { children: React.ReactNode }) {
  const value = useCreatorStoreController();
  return createElement(CreatorStoreContext.Provider, { value }, children);
}

export function useCreatorStore() {
  const value = useContext(CreatorStoreContext);
  if (!value) {
    throw new Error("useCreatorStore must be used within CreatorStoreProvider");
  }
  return value;
}

function useCreatorStoreController() {
  const [state, setState] = useState<CreatorState>(() => readState());
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
    const result = await hydrateFromApi(fetchCreatorState, writeState);
    if (result.ok) {
      setState(result.data);
      setStatus("ready");
      return;
    }
    setState(readState());
    setError(result.error);
    setStatus(
      result.kind === "unauthenticated"
        ? "unauthenticated"
        : result.kind === "forbidden"
          ? "forbidden"
          : "error",
    );
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const sync = () => setState(readState());
    window.addEventListener("creator-store-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("creator-store-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const persist = useCallback((updater: (prev: CreatorState) => CreatorState) => {
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

  const updateProfile = useCallback(
    (patch: Partial<CreatorProfile>) => {
      persist((s) => ({
        ...s,
        profile: { ...s.profile, ...patch },
      }));
      void notifyMutationFailure(() => apiUpdateCreatorProfile(patch));
      recordPlatformEvent({
        actorName: state.profile.displayName,
        actorRole: "creator",
        action: "profile_updated",
        summary: `${state.profile.displayName} updated their creator profile`,
        targetLabel: state.profile.displayName,
        href: "/admin/creators",
        severity: severityForAction("profile_updated"),
      });
    },
    [notifyMutationFailure, persist, state.profile.displayName],
  );

  const applyToCampaign = useCallback(
    (campaignId: string, pitch?: string) => {
      const campaign = state.discover.find((c) => c.id === campaignId);
      persist((s) => {
        if (s.applications.some((a) => a.campaignId === campaignId)) return s;
        const campaign = s.discover.find((c) => c.id === campaignId);
        if (!campaign?.open) return s;
        const application: CampaignApplication = {
          campaignId,
          status: "pending",
          appliedAt: new Date().toISOString(),
          pitch: pitch?.trim(),
        };
        return {
          ...s,
          applications: [...s.applications, application],
          discover: s.discover.map((c) =>
            c.id === campaignId
              ? { ...c, spotsLeft: Math.max(0, c.spotsLeft - 1) }
              : c,
          ),
        };
      });
      void notifyMutationFailure(() => apiApplyToCampaign(campaignId, pitch));
      recordPlatformEvent({
        actorName: state.profile.displayName,
        actorRole: "creator",
        action: "campaign_applied",
        summary: campaign
          ? `${state.profile.displayName} applied to ${campaign.title}`
          : `${state.profile.displayName} applied to a campaign`,
        targetLabel: campaign?.title,
        href: "/admin/creators",
        severity: severityForAction("campaign_applied"),
      });
    },
    [notifyMutationFailure, persist, state.discover, state.profile.displayName],
  );

  const submitAssignment = useCallback(
    (assignmentId: string, postUrl: string) => {
      const url = postUrl.trim();
      const assignment = state.assignments.find((a) => a.id === assignmentId);
      persist((s) => {
        const assignment = s.assignments.find((a) => a.id === assignmentId);
        if (!assignment) return s;

        const updated: CreatorAssignment = {
          ...assignment,
          postUrl: url,
          status: "pending",
        };

        const earningsExists = s.earnings.some(
          (e) => e.campaignTitle === assignment.title && e.status === "pending",
        );

        return {
          ...s,
          assignments: s.assignments.map((a) =>
            a.id === assignmentId ? updated : a,
          ),
          earnings: earningsExists
            ? s.earnings
            : [
                ...s.earnings,
                {
                  id: nextId("earn"),
                  campaignTitle: assignment.title,
                  amountRwf: assignment.payoutRwf,
                  status: "pending" as const,
                },
              ],
        };
      });
      void notifyMutationFailure(() => apiSubmitAssignment(assignmentId, url));
      recordPlatformEvent({
        actorName: state.profile.displayName,
        actorRole: "creator",
        action: "submission_created",
        summary: assignment
          ? `${state.profile.displayName} submitted a post for ${assignment.title}`
          : `${state.profile.displayName} submitted a post`,
        targetLabel: assignment?.title,
        href: "/admin/submissions",
        severity: severityForAction("submission_created"),
      });
    },
    [notifyMutationFailure, persist, state.assignments, state.profile.displayName],
  );

  return {
    state,
    status,
    error,
    actionError,
    retryHydration: hydrate,
    clearActionError: () => setActionError(null),
    updateProfile,
    applyToCampaign,
    submitAssignment,
  };
}

export function selectCreatorDashboard(state: CreatorState) {
  const approvedRwf = state.earnings
    .filter((e) => e.status === "approved")
    .reduce((s, e) => s + e.amountRwf, 0);
  const pendingRwf = state.earnings
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + e.amountRwf, 0);
  const actionNeeded = state.assignments.filter(
    (a) => a.status === "not_submitted" || a.status === "revision",
  ).length;
  const openCampaigns = state.discover.filter((c) => c.open).length;
  return { approvedRwf, pendingRwf, actionNeeded, openCampaigns };
}

export function applicationForCampaign(
  state: CreatorState,
  campaignId: string,
): CampaignApplication | undefined {
  return state.applications.find((a) => a.campaignId === campaignId);
}
