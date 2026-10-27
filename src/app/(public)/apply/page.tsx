import { CreatorApplicationForm } from "@/features/creators";

export default function ApplyPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Creator application</h1>
      <p className="mt-2 text-neutral-600">
        Tell us about your content and we&apos;ll review your profile.
      </p>
      <CreatorApplicationForm />
    </main>
  );
}
