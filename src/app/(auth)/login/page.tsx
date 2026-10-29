import { LoginForm } from "@/features/auth";
import { marketingType } from "@/lib/marketing";
import Link from "next/link";
import { routes } from "@/config/routes";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils/cn";

type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const requestedRole = Array.isArray(params.role)
    ? params.role[0]
    : params.role;
  const initialRole: Exclude<UserRole, "admin"> =
    requestedRole === "brand" ? "brand" : "creator";
  const registerRole = initialRole;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 sm:py-20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-mkt-accent">
        Welcome back
      </p>
      <h1 className={cn(marketingType.pageTitle, "text-mkt-fg")}>
        Sign in to your workspace
      </h1>
      <p className={cn(marketingType.sectionLead, "text-mkt-fg-muted")}>
        Choose a demo workspace to continue. No account service is connected.
      </p>
      <LoginForm initialRole={initialRole} />
      <p className="mt-8 border-t border-mkt-border pt-6 text-sm text-mkt-fg-muted">
        New to Creators?{" "}
        <Link
          href={`${routes.auth.register}?role=${registerRole}`}
          className="font-medium text-mkt-fg underline decoration-mkt-accent underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
