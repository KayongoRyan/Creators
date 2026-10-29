export const routes = {
  public: {
    home: "/",
    apply: "/apply",
  },
  auth: {
    login: "/login",
    register: "/register",
  },
  admin: {
    root: "/admin",
    campaigns: "/admin/campaigns",
    creators: "/admin/creators",
    brands: "/admin/brands",
    submissions: "/admin/submissions",
    payments: "/admin/payments",
  },
  brand: {
    root: "/brand",
    campaigns: "/brand/campaigns",
    invoices: "/brand/invoices",
    reports: "/brand/reports",
    campaign: (id: string) => `/brand/campaigns/${id}`,
  },
  creator: {
    root: "/creator",
    campaigns: "/creator/campaigns",
    tasks: "/creator/tasks",
    applications: "/creator/applications",
    submissions: "/creator/submissions",
    earnings: "/creator/earnings",
    campaign: (id: string) => `/creator/campaigns/${id}`,
  },
} as const;
