import { LoginForm } from "@/features/auth";
import { marketingType } from "@/lib/marketing";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm flex-1 px-6 py-16 sm:py-24">
      <h1 className={marketingType.pageTitle}>Sign in</h1>
      <LoginForm />
    </div>
  );
}
