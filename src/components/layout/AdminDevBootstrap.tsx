"use client";

import { useEffect } from "react";
import { ensureAdminDevSession } from "@/features/auth/demoSession";

/** `npm run dev:admin` — seed an admin session so the portal opens without the join flow. */
export function AdminDevBootstrap() {
  useEffect(() => {
    ensureAdminDevSession({ method: "login" });
  }, []);

  return null;
}