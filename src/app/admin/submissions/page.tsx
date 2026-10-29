import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function AdminSubmissionsPage() {
  redirect(routes.admin.campaigns);
}
