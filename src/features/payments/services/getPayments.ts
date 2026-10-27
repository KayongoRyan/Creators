import { fetchResource } from "@/lib/api/fetchResource";
import type { Payment } from "@/types";

export async function getPayments() {
  return fetchResource<Payment[]>("payments", "/payments");
}
