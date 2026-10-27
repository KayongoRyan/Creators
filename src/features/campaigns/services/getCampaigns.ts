import { fetchResource } from "@/lib/api/fetchResource";
import type { Campaign } from "@/types";

export async function getCampaigns() {
  return fetchResource<Campaign[]>("campaigns", "/campaigns");
}
