import { Suspense } from "react";
import { VerifyEmailOtp } from "@/features/auth/components/VerifyEmailOtp";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
          Loading…
        </div>
      }
    >
      <VerifyEmailOtp />
    </Suspense>
  );
}
