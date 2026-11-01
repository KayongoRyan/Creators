import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const role = Array.isArray(params.role) ? params.role[0] : params.role;
  const query = new URLSearchParams({ mode: "login" });
  if (role === "brand" || role === "creator") {
    query.set("role", role);
  }
  redirect(`${routes.auth.join}?${query.toString()}`);
}
