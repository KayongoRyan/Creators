import { LoginForm } from "@/features/auth";
import { marketingType } from "@/lib/marketing";
import Link from "next/link";
import { routes } from "@/config/routes";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 sm:py-20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Welcome back
      </p>
      <h1 className={marketingType.pageTitle}>Sign in to your workspace</h1>
      <p className={marketingType.sectionLead}>
        Choose a demo workspace to continue. No account service is connected.
      </p>
      <LoginForm />
      <p className="mt-8 border-t border-black/10 pt-6 text-sm text-gray-600">
        New to Creators?{" "}
        <Link
          href={routes.auth.register}
          className="font-medium text-gray-900 underline decoration-emerald-500 underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
