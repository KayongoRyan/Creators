export const siteConfig = {
  name: "Creators",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  /** Set NEXT_PUBLIC_USE_MOCK=0 when a real API is available. */
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK !== "0",
} as const;
