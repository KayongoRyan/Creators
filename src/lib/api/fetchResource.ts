import { siteConfig } from "@/config/site";
import { apiClient } from "./client";
import { fixtures } from "./fixtures";

export async function fetchResource<T>(
  path: keyof typeof fixtures,
  apiPath: string,
): Promise<T> {
  if (siteConfig.useMockData) {
    return fixtures[path] as T;
  }

  return apiClient<T>(apiPath);
}
