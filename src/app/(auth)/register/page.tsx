import { RegisterForm } from "@/features/auth";
import { marketingType } from "@/lib/marketing";
import Link from "next/link";
import { routes } from "@/config/routes";

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 sm:py-20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Get started
      </p>
      <h1 className={marketingType.pageTitle}>Create your workspace</h1>
      <p className={marketingType.sectionLead}>
        Choose a role for this frontend demo. You can explore creator, brand, or
        admin screens without connecting an account service.
      </p>
      <RegisterForm />
      <p className="mt-8 border-t border-black/10 pt-6 text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href={routes.auth.login}
          className="font-medium text-gray-900 underline decoration-emerald-500 underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
