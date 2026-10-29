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

function readState(): BrandState {
  if (typeof window === "undefined") return brandSeed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(brandSeed);
    return JSON.parse(raw) as BrandState;
  } catch {
    return structuredClone(brandSeed);
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
