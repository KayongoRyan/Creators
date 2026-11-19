import { apiClient } from "./client";

export async function fetchResource<T>(apiPath: string): Promise<T> {
  return apiClient<T>(apiPath);
}