import { fetchResource } from "@/lib/api/fetchResource";
import type { EarningsSnapshot } from "@/lib/api/fixtures";

export async function getEarnings() {
  return fetchResource<EarningsSnapshot>("earnings", "/earnings");
}
