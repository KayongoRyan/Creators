/** Set via `NEXT_PUBLIC_PORTAL_SCOPE` in role dev scripts (`.next-admin`, etc.). */
export function portalScope() {
  return process.env.NEXT_PUBLIC_PORTAL_SCOPE ?? ".next";
}

export function isAdminOnlyPortal() {
  return portalScope() === ".next-admin";
}