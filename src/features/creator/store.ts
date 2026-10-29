"use client";

import { useCallback, useEffect, useState } from "react";
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

export function useCreatorStore() {
  const [state, setState] = useState<CreatorState>(() => readState());

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

  const updateProfile = useCallback(
    (patch: Partial<CreatorProfile>) => {
      persist((s) => ({
        ...s,
        profile: { ...s.profile, ...patch },
      }));
    },
    [persist],
  );

  const applyToCampaign = useCallback(
    (campaignId: string, pitch?: string) => {
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
    },
    [persist],
  );

  const submitAssignment = useCallback(
    (assignmentId: string, postUrl: string) => {
      persist((s) => {
        const assignment = s.assignments.find((a) => a.id === assignmentId);
        if (!assignment) return s;

        const updated: CreatorAssignment = {
          ...assignment,
          postUrl: postUrl.trim(),
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
    },
    [persist],
  );

  return {
    state,
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
