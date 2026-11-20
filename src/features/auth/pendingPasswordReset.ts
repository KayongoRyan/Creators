const PENDING_PASSWORD_RESET_KEY = "creators.pending_password_reset.v1";

export type PendingPasswordResetSession = {
  email: string;
  bypass?: boolean;
  /** epoch ms when current OTP was issued (60s TTL). */
  otpIssuedAt?: number;
};

export function writePendingPasswordReset(session: PendingPasswordResetSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    PENDING_PASSWORD_RESET_KEY,
    JSON.stringify(session),
  );
}

export function readPendingPasswordReset(): PendingPasswordResetSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_PASSWORD_RESET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPasswordResetSession;
    if (!parsed?.email || typeof parsed.email !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPasswordReset() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_PASSWORD_RESET_KEY);
}
