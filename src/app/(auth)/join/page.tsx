import { Suspense } from "react";
import { JoinWizard } from "@/features/auth/components/JoinWizard";

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
          Loading…
        </div>
      }
    >
      <JoinWizard />
    </Suspense>
  );
}
