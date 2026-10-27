import Link from "next/link";
import { routes } from "@/config/routes";
import { marketingType } from "@/lib/marketing";

export function ClosingCta() {
  return (
    <section className="bg-[linear-gradient(180deg,#65FBAA_0%,#31F49C_50%,#00EC97_100%)] text-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-6 py-24 sm:px-8 sm:py-32">
        <h2 className={`max-w-3xl ${marketingType.hero}`}>
          A brief can be open today.
        </h2>
        <p className={`max-w-md ${marketingType.body} text-gray-900`}>
          Apply with your name, the work you make, and a portfolio.
        </p>
        <Link href={routes.public.apply} className={marketingType.ctaPrimary}>
          Apply as creator
        </Link>
      </div>
    </section>
  );
}
