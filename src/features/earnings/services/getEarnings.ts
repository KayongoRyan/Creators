import { fetchResource } from "@/lib/api/fetchResource";
import type { EarningsSnapshot } from "@/lib/api/resourceTypes";

export async function getEarnings() {
  return fetchResource<EarningsSnapshot>("/earnings");
}
