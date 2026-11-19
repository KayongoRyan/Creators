export const siteConfig = {
  name: "Creators",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
} as const;
