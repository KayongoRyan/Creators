import { fetchResource } from "@/lib/api/fetchResource";
import type { Submission } from "@/types";

export async function getSubmissions() {
  return fetchResource<Submission[]>("submissions", "/submissions");
}
