import { CreatorApplicationForm } from "@/features/creators";
import {
  InspiredContactRow,
  InspiredFormCard,
  InspiredFormSplit,
} from "@/components/shared/inspiredForm";
import { marketingType } from "@/lib/marketing";
import { creatorsLanding } from "@/content/creatorsLanding";

export default function ApplyPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <InspiredFormCard>
        <InspiredFormSplit
          aside={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                Creator application
              </p>
              <h1 className={`mt-3 ${marketingType.pageTitle}`}>
                Help the right brands find you.
              </h1>
              <p className={`${marketingType.sectionLead} max-w-md`}>
                Tell us what you create, choose the topics that fit, and share a sample of your
                work. Our team reviews every profile.
              </p>
            </>
          }
          panel={<CreatorApplicationForm />}
          footer={
            <>
              <InspiredContactRow
                items={[
                  {
                    label: "Press",
                    value: creatorsLanding.mission.press,
                    href: `mailto:${creatorsLanding.mission.press}`,
                  },
                  {
                    label: "Support",
                    value: creatorsLanding.mission.support,
                    href: `mailto:${creatorsLanding.mission.support}`,
                  },
                  {
                    label: "What happens next",
                    value: "Review in 3–5 business days",
                  },
                ]}
              />
              <ol className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ["Build your profile", "Choose topics that represent your work."],
                  ["Profile review", "Our team checks every application."],
                  ["Find your fit", "Get matched to relevant campaigns."],
                ].map(([title, body], index) => (
                  <li key={title}>
                    <p className="text-xs text-gray-500">Step {index + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-gray-600">{body}</p>
                  </li>
                ))}
              </ol>
            </>
          }
        />
      </InspiredFormCard>
    </section>
  );
}
