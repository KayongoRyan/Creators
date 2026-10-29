import { RegisterForm } from "@/features/auth";
import { marketingType } from "@/lib/marketing";
import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

type RegisterPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const requestedRole = Array.isArray(params.role)
    ? params.role[0]
    : params.role;
  const initialRole = requestedRole === "brand" ? "brand" : "creator";

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 sm:py-20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-mkt-accent">
        Choose your workspace
      </p>
      <h1 className={cn(marketingType.pageTitle, "text-mkt-fg")}>
        Create your account
      </h1>
      <p className={cn(marketingType.sectionLead, "text-mkt-fg-muted")}>
        Choose Creator to find brand campaigns or Brand to launch campaigns and
        review creator content.
      </p>
      <RegisterForm initialRole={initialRole} />
      <p className="mt-8 border-t border-mkt-border pt-6 text-sm text-mkt-fg-muted">
        Already have an account?{" "}
        <Link
          href={`${routes.auth.login}?role=${initialRole}`}
          className="font-medium text-mkt-fg underline decoration-mkt-accent underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
