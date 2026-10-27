import { CreatorApplicationForm } from "@/features/creators";

export default function ApplyPage() {
  return (
    <section className="mx-auto w-full max-w-7xl border-x border-black/[0.08] px-6 py-16 sm:px-8 sm:py-24">
      <div className="max-w-xl">
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Creator application
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Tell us what you make. A person reviews the profile.
        </p>
        <CreatorApplicationForm />
      </div>
    </section>
  );
}
