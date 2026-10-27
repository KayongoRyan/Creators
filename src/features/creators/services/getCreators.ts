import { fetchResource } from "@/lib/api/fetchResource";
import type { CreatorRecord } from "@/lib/api/fixtures";

export async function getCreators() {
  return fetchResource<CreatorRecord[]>("creators", "/creators");
}
