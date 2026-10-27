import { fetchResource } from "@/lib/api/fetchResource";
import type { BrandRecord } from "@/lib/api/fixtures";

export async function getBrands() {
  return fetchResource<BrandRecord[]>("brands", "/brands");
}
