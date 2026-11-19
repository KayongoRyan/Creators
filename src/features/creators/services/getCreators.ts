import { fetchResource } from "@/lib/api/fetchResource";
import type { CreatorRecord } from "@/lib/api/resourceTypes";

export async function getCreators() {
  return fetchResource<CreatorRecord[]>("/creators");
}
