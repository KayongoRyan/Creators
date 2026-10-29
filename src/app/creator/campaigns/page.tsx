import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function CreatorCampaignsPage() {
  redirect(routes.creator.root);
}
