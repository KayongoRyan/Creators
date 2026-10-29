/** REST paths relative to `NEXT_PUBLIC_API_URL` (see docs/BACKEND_INTEGRATION.md). */
export const apiEndpoints = {
  campaigns: "/campaigns",
  submissions: "/submissions",
  payments: "/payments",
  earnings: "/earnings",
  brands: "/brands",
  creators: "/creators",
  admin: {
    state: "/admin/state",
    campaigns: "/admin/campaigns",
    creatorsVerify: (id: string) => `/admin/creators/${id}/verify`,
    creatorsReject: (id: string) => `/admin/creators/${id}/reject`,
    submissionApprove: (id: string) => `/admin/submissions/${id}/approve`,
    submissionReject: (id: string) => `/admin/submissions/${id}/reject`,
    submissionRevision: (id: string) => `/admin/submissions/${id}/revision`,
    payoutMarkPaid: (id: string) => `/admin/payouts/${id}/mark-paid`,
    payoutsMarkAllPaid: "/admin/payouts/mark-all-paid",
  },
  brand: {
    state: "/brand/state",
  },
  creator: {
    state: "/creator/state",
    applications: "/creator/applications",
    assignmentSubmit: (id: string) => `/creator/assignments/${id}/submit`,
    profile: "/creator/profile",
  },
} as const;
