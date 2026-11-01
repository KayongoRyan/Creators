import { RegisterForm } from "@/features/auth";
import { InspiredFormCard, InspiredFormSplit } from "@/components/shared/inspiredForm";
import { marketingType } from "@/lib/marketing";
import Link from "next/link";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils/cn";

type RegisterPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const requestedRole = Array.isArray(params.role) ? params.role[0] : params.role;
  const initialRole = requestedRole === "brand" ? "brand" : "creator";

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <InspiredFormCard>
        <InspiredFormSplit
          aside={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                Choose your workspace
              </p>
              <h1 className={cn(marketingType.pageTitle, "mt-3")}>Create your account</h1>
              <p className={cn(marketingType.sectionLead, "text-gray-600")}>
                {initialRole === "brand"
                  ? "Launch campaigns, review creators, and manage deliverables from one place."
                  : "Find briefs that fit your style and keep applications, content, and payouts together."}
              </p>
              <p className="mt-8 text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href={`${routes.auth.login}?role=${initialRole}`}
                  className="font-semibold text-gray-900 underline decoration-[#00EC97] underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </>
          }
          panel={
            <>
              <RegisterForm initialRole={initialRole} />
            </>
          }
        />
      </InspiredFormCard>
    </div>
  );
}
