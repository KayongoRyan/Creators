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
    campaignFund: (id: string) => `/admin/campaigns/${id}/fund`,
    campaignSnapshot: (id: string) => `/admin/campaigns/${id}/snapshot`,
    campaignReport: (id: string) => `/admin/campaigns/${id}/report`,
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
  public: {
    creatorApplications: "/public/creator-applications",
  },
  auth: {
    devToken: "/auth/dev-token",
    login: "/auth/login",
    signup: "/auth/signup",
  },
} as const;
