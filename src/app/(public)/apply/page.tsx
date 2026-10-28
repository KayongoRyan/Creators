import { CreatorApplicationForm } from "@/features/creators";
import {
  marketingFrame,
  marketingType,
} from "@/lib/marketing";

export default function ApplyPage() {
  return (
    <section
      className={`mx-auto w-full max-w-7xl ${marketingFrame} px-6 py-14 sm:px-8 sm:py-20`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Creator application
          </p>
          <h1 className={marketingType.pageTitle}>
            Help the right brands find you.
          </h1>
          <p className={marketingType.sectionLead}>
            Tell us what you create, choose the topics that fit, and share a
            sample of your work. Our team reviews every profile.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
          <CreatorApplicationForm />
          <aside className="border-t border-emerald-500 pt-6 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              What happens next
            </p>
            <ol className="mt-6 space-y-6">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-900">
                  1
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Build your profile
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Choose the topics and work that best represent you.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-900">
                  2
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Profile review
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Our team takes a look at your application.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-900">
                  3
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Find your fit
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Your profile helps surface campaigns relevant to your work.
                  </p>
                </div>
              </li>
            </ol>
            <p className="mt-8 border-t border-black/10 pt-5 text-sm leading-5 text-gray-600">
              You can choose more than one niche. Pick every topic you can
              confidently create content about.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
