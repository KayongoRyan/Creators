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
import { fetchBrandState } from "@/lib/api/portalApi";
import { hydrateFromApi, type PortalLoadStatus } from "@/lib/portal/hydration";
import { brandSeed } from "@/lib/portalSeeds";
import type { BrandState } from "@/types";

const STORAGE_KEY = "creators_brand_state_v1";

function withBrandDemoFallback(data: BrandState): BrandState {
  const seed = structuredClone(brandSeed);
  const campaignsMissing = !data.campaigns?.length;
  const invoicesNeedSeed =
    !data.invoices?.length || data.invoices.some((inv) => !inv.campaignId);

  if (!campaignsMissing && !invoicesNeedSeed) return data;

  return {
    ...data,
    brandName: data.brandName?.trim() ? data.brandName : seed.brandName,
    companyLine: data.companyLine?.trim() ? data.companyLine : seed.companyLine,
    campaigns: campaignsMissing ? seed.campaigns : data.campaigns,
    invoices: invoicesNeedSeed ? seed.invoices : data.invoices,
  };
}

function readState(): BrandState {
  if (typeof window === "undefined") return structuredClone(brandSeed);
  const seed = structuredClone(brandSeed);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as BrandState;
    return withBrandDemoFallback(parsed);
  } catch {
    return seed;
  }
}

function writeState(state: BrandState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const [state, setState] = useState<BrandState>(() => readState());
  const [status, setStatus] = useState<PortalLoadStatus>(() =>
    siteConfig.useMockData ? "ready" : "loading",
  );
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    if (siteConfig.useMockData) {
      setState(readState());
      setStatus("ready");
      setError(null);
      return;
    }
    setStatus("loading");
    setError(null);
    const result = await hydrateFromApi(fetchBrandState, writeState);
    if (result.ok) {
      setState(withBrandDemoFallback(result.data));
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
    window.addEventListener("brand-store-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("brand-store-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    state,
    status,
    error,
    retryHydration: hydrate,
  };
}

export function selectBrandDashboard(state: BrandState) {
  const active = state.campaigns.filter((c) => c.status === "active");
  const assigned = active.reduce((n, c) => n + c.assignedCreators, 0);
  const submitted = active.reduce((n, c) => n + c.submitted, 0);
  const approved = active.reduce((n, c) => n + c.approved, 0);
  return { activeCount: active.length, assigned, submitted, approved };
}
