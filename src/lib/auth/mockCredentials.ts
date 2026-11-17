import type { UserRole } from "@/types";

export const MOCK_DEMO_PASSWORD = "CreatorsDemo1!";

export type MockCredential = {
  role: UserRole;
  password: string;
  displayName: string;
};

/** Matches `apps/api/scripts/seed_auth_users.py` (+ local dev admin seed email). */
export const mockCredentialByEmail: Record<string, MockCredential> = {
  "admin@ubunifu.dev": {
    role: "admin",
    password: MOCK_DEMO_PASSWORD,
    displayName: "Admin",
  },
  "brand@ubunifu.dev": {
    role: "brand",
    password: MOCK_DEMO_PASSWORD,
    displayName: "Brand",
  },
  "creator@ubunifu.dev": {
    role: "creator",
    password: MOCK_DEMO_PASSWORD,
    displayName: "Creator",
  },
  "admin@creators.rw": {
    role: "admin",
    password: MOCK_DEMO_PASSWORD,
    displayName: "Platform Admin",
  },
};

export function lookupMockCredential(email: string, role: string) {
  const entry = mockCredentialByEmail[email.trim().toLowerCase()];
  if (!entry || entry.role !== role) return null;
  return entry;
}