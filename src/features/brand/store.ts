"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  apiCreateBrandCampaign,
  fetchBrandState,
} from "@/lib/api/portalApi";
import {
  hydrateFromApi,
  runApiMutation,
  type PortalLoadStatus,
} from "@/lib/portal/hydration";
import { emptyBrandState } from "@/lib/portal/emptyState";
import type {
  BrandCampaignView,
  BrandCreateCampaignInput,
  BrandState,
} from "@/types";

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

const STORAGE_KEY = "creators_brand_state_v2";
const LEGACY_STORAGE_KEY = "creators_brand_state_v1";

function normalizeBrandState(data: BrandState): BrandState {
  return {
    brandName: data.brandName ?? "",
    companyLine: data.companyLine ?? "",
    campaigns: dedupeById(data.campaigns ?? []),
    invoices: dedupeById(data.invoices ?? []),
  };
}

function readState(): BrandState {
  if (typeof window === "undefined") return emptyBrandState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyBrandState();
    return normalizeBrandState(JSON.parse(raw) as BrandState);
  } catch {
    return emptyBrandState();
  }
}

function writeState(state: BrandState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("brand-store-updated"));
}

type BrandStoreValue = ReturnType<typeof useBrandStoreController>;

const BrandStoreContext = createContext<BrandStoreValue | null>(null);

export function BrandStoreProvider({ children }: { children: React.ReactNode }) {
  const value = useBrandStoreController();
  return createElement(BrandStoreContext.Provider, { value }, children);
}

export function useBrandStore() {
  const value = useContext(BrandStoreContext);
  if (!value) {
    throw new Error("useBrandStore must be used within BrandStoreProvider");
  }
  return value;
}

function useBrandStoreController() {
  const [state, setState] = useState<BrandState>(() => emptyBrandState());
  const [status, setStatus] = useState<PortalLoadStatus>(() => "loading");
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    setStatus("loading");
    setError(null);
    const result = await hydrateFromApi(fetchBrandState, writeState);
    if (result.ok) {
      setState(normalizeBrandState(result.data));
      setStatus("ready");
      return;
    }
    setState(emptyBrandState());
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
    window.addEventListener("brand-store-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("brand-store-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const createCampaign = useCallback(async (input: BrandCreateCampaignInput) => {
    const title = input.title.trim();
    const feeRwf = Math.round(input.budgetRwf * 0.2);
    let campaignId: string | null = null;
    const result = await runApiMutation(async () => {
      const body = await apiCreateBrandCampaign(input);
      campaignId = body.id;
    });
    if (!result.ok) {
      setError(result.error);
      throw new Error(result.error);
    }
    if (!campaignId) {
      throw new Error("API did not return a campaign id.");
    }
    const hydrated = await hydrateFromApi(fetchBrandState, (data) =>
      writeState(normalizeBrandState(data)),
    );
    if (!hydrated.ok) {
      setError(hydrated.error);
      throw new Error(hydrated.error);
    }
    let next = normalizeBrandState(hydrated.data);
    let created = next.campaigns.find((c) => c.id === campaignId);
    if (!created) {
      const retry = await hydrateFromApi(fetchBrandState, (data) =>
        writeState(normalizeBrandState(data)),
      );
      if (retry.ok) {
        next = normalizeBrandState(retry.data);
        created = next.campaigns.find((c) => c.id === campaignId);
      }
    }
    if (!created) {
      const fallback: BrandCampaignView = {
        id: campaignId,
        title,
        status: "draft",
        runPeriod: `Opens ${input.deadline}`,
        budgetRwf: input.budgetRwf,
        feeRwf,
        campaignType: input.campaignType.trim(),
        brief: input.brief.trim() || "Brief to be finalized with your team.",
        assignedCreators: 0,
        submitted: 0,
        approved: 0,
        posts: [],
        performance: { totalViews: 0, engagementRate: "—", spendRwf: 0 },
      };
      next = normalizeBrandState({
        ...next,
        campaigns: [fallback, ...next.campaigns],
      });
      created = fallback;
    }
    setState(next);
    writeState(next);
    return created;
  }, []);

  return {
    state,
    status,
    error,
    retryHydration: hydrate,
    createCampaign,
  };
}

export function selectBrandDashboard(state: BrandState) {
  const active = state.campaigns.filter((c) => c.status === "active");
  const assigned = active.reduce((n, c) => n + c.assignedCreators, 0);
  const submitted = active.reduce((n, c) => n + c.submitted, 0);
  const approved = active.reduce((n, c) => n + c.approved, 0);
  return { activeCount: active.length, assigned, submitted, approved };
}