import { LoginForm } from "@/features/auth";
import { InspiredFormCard, InspiredFormSplit } from "@/components/shared/inspiredForm";
import { marketingType } from "@/lib/marketing";
import Link from "next/link";
import { routes } from "@/config/routes";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils/cn";

type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const requestedRole = Array.isArray(params.role) ? params.role[0] : params.role;
  const initialRole: Exclude<UserRole, "admin"> =
    requestedRole === "brand" ? "brand" : "creator";
  const registerRole = initialRole;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <InspiredFormCard>
        <InspiredFormSplit
          aside={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                Welcome back
              </p>
              <h1 className={cn(marketingType.pageTitle, "mt-3")}>
                Sign in to your workspace
              </h1>
              <p className={cn(marketingType.sectionLead, "text-gray-600")}>
                Choose a demo workspace to continue. No account service is connected.
              </p>
              <p className="mt-8 text-sm text-gray-600">
                New to Creators?{" "}
                <Link
                  href={`${routes.auth.register}?role=${registerRole}`}
                  className="font-semibold text-gray-900 underline decoration-[#00EC97] underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </>
          }
          panel={<LoginForm initialRole={initialRole} />}
        />
      </InspiredFormCard>
    </div>
  );
}
