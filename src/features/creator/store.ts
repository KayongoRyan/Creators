"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
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
import { emptyCreatorState } from "@/lib/portal/emptyState";
import type {
  CampaignApplication,
  CreatorAssignment,
  CreatorProfile,
  CreatorState,
} from "@/types";

const STORAGE_KEY = "creators_creator_state_v2";
const LEGACY_STORAGE_KEY = "creators_creator_state_v1";

function readState(): CreatorState {
  if (typeof window === "undefined") return emptyCreatorState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCreatorState();
    return JSON.parse(raw) as CreatorState;
  } catch {
    return emptyCreatorState();
  }
}

function writeState(state: CreatorState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
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
  const [state, setState] = useState<CreatorState>(() => emptyCreatorState());
  const [status, setStatus] = useState<PortalLoadStatus>(() => "loading");
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    setStatus("loading");
    setError(null);
    const result = await hydrateFromApi(fetchCreatorState, writeState);
    if (result.ok) {
      setState(result.data);
      setStatus("ready");
      return;
    }
    setState(emptyCreatorState());
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
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
      void (async () => {
        const result = await runApiMutation(() =>
          apiApplyToCampaign(campaignId, pitch),
        );
        if (!result.ok) {
          setActionError(result.error);
          return;
        }
        // Rehydrate so the new Assignment shows under Tasks (apply creates it for open campaigns).
        const hydrated = await hydrateFromApi(fetchCreatorState, writeState);
        if (hydrated.ok) {
          setState(hydrated.data);
        } else {
          persist((s) => {
            if (s.applications.some((a) => a.campaignId === campaignId)) return s;
            const row = s.discover.find((c) => c.id === campaignId);
            if (!row?.open) return s;
            const application: CampaignApplication = {
              campaignId,
              status: "accepted",
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
        }
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
      })();
    },
    [persist, state.discover, state.profile.displayName],
  );

  const submitAssignment = useCallback(
    async (assignmentId: string, postUrl: string) => {
      const url = postUrl.trim();
      if (!url) {
        setActionError("Post URL is required");
        return false;
      }
      const assignment = state.assignments.find((a) => a.id === assignmentId);
      const result = await runApiMutation(() =>
        apiSubmitAssignment(assignmentId, url),
      );
      if (!result.ok) {
        setActionError(result.error);
        return false;
      }
      setActionError(null);
      // Rehydrate so Tasks/Submissions match DB (admin reads submissions table).
      const hydrated = await hydrateFromApi(fetchCreatorState, writeState);
      if (hydrated.ok) {
        setState(hydrated.data);
      } else {
        persist((s) => {
          const row = s.assignments.find((a) => a.id === assignmentId);
          if (!row) return s;
          const updated: CreatorAssignment = {
            ...row,
            postUrl: url,
            status: "pending",
          };
          const earningsExists = s.earnings.some(
            (e) => e.campaignTitle === row.title && e.status === "pending",
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
                    campaignTitle: row.title,
                    amountRwf: row.payoutRwf,
                    status: "pending" as const,
                  },
                ],
          };
        });
      }
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
      return true;
    },
    [persist, state.assignments, state.profile.displayName],
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
