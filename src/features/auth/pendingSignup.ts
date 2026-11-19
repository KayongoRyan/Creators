import type { UserRole } from "@/types";

const PENDING_SIGNUP_KEY = "creators.pending_signup.v1";

export type PendingSignupSession = {
  email: string;
  role: Extract<UserRole, "creator" | "brand">;
  displayName: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  niches?: string[];
  bypass?: boolean;
};

export function writePendingSignup(session: PendingSignupSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(session));
}

export function readPendingSignup(): PendingSignupSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_SIGNUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingSignupSession;
    if (
      !parsed?.email ||
      (parsed.role !== "creator" && parsed.role !== "brand")
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingSignup() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_SIGNUP_KEY);
}
