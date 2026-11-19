import { expect, test } from "@playwright/test";

test("API health is JSON", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({ ok: true });
});

test("demo admin login returns access token", async ({ request }) => {
  const response = await request.post("/api/auth/login", {
    data: {
      email: "admin@ubunifu.dev",
      password: "CreatorsDemo1!",
      role: "admin",
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.accessToken).toBeTruthy();
  expect(body.role).toBe("admin");

  const state = await request.get("/api/admin/state", {
    headers: { Authorization: `Bearer ${body.accessToken}` },
  });
  expect(state.ok()).toBeTruthy();
  const admin = await state.json();
  expect(Array.isArray(admin.campaigns)).toBeTruthy();
  expect(Array.isArray(admin.analytics?.daily)).toBeTruthy();
});
