import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

type RegisterPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const role = Array.isArray(params.role) ? params.role[0] : params.role;
  const query = new URLSearchParams({ mode: "signup" });
  if (role === "brand" || role === "creator") {
    query.set("role", role);
  }
  redirect(`${routes.auth.join}?${query.toString()}`);
}
