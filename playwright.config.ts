import { defineConfig } from "@playwright/test";

const apiPort = process.env.E2E_API_PORT ?? "4010";
const apiBase = `http://127.0.0.1:${apiPort}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? apiBase,
    trace: "on-first-retry",
  },
  webServer: {
    command: `node scripts/dev-api.mjs`,
    url: `${apiBase}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: apiPort,
      AUTH_DEV: "1",
      SEED_DEMO: "1",
      JWT_SECRET: "ci-test-secret-must-be-32-bytes-min",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      SUPABASE_ANON_KEY: "",
      SUPABASE_JWT_SECRET: "",
      DATABASE_URL: "sqlite:///apps/api/.data/e2e.db",
    },
  },
});
