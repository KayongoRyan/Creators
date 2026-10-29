import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function CreatorSubmissionsPage() {
  redirect(routes.creator.root);
}
