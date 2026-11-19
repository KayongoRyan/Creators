import { fetchResource } from "@/lib/api/fetchResource";
import type { BrandRecord } from "@/lib/api/resourceTypes";

export async function getBrands() {
  return fetchResource<BrandRecord[]>("/brands");
}
