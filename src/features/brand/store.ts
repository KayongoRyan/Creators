"use client";

import { useCallback, useEffect, useState } from "react";
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

export function useBrandStore() {
  const [state, setState] = useState<BrandState>(() => readState());

  useEffect(() => {
    const sync = () => setState(readState());
    window.addEventListener("brand-store-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("brand-store-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const persist = useCallback((updater: (prev: BrandState) => BrandState) => {
    setState((prev) => {
      const next = updater(prev);
      writeState(next);
      return next;
    });
  }, []);

  return { state, persist };
}

export function selectBrandDashboard(state: BrandState) {
  const active = state.campaigns.filter((c) => c.status === "active");
  const assigned = active.reduce((n, c) => n + c.assignedCreators, 0);
  const submitted = active.reduce((n, c) => n + c.submitted, 0);
  const approved = active.reduce((n, c) => n + c.approved, 0);
  return { activeCount: active.length, assigned, submitted, approved };
}
