import { CreatorApplicationForm } from "@/features/creators";
import {
  marketingFrame,
  marketingType,
} from "@/lib/marketing";

export default function ApplyPage() {
  return (
    <section
      className={`mx-auto w-full max-w-7xl ${marketingFrame} px-6 py-16 sm:px-8 sm:py-24`}
    >
      <div className="max-w-xl">
        <h1 className={marketingType.pageTitle}>Creator application</h1>
        <p className={marketingType.sectionLead}>
          Tell us what you make. A person reviews the profile.
        </p>
        <CreatorApplicationForm />
      </div>
    </section>
  );
}
