import Link from "next/link";
import { routes } from "@/config/routes";

export function ClosingCta() {
  return (
    <section className="bg-[linear-gradient(180deg,#65FBAA_0%,#31F49C_50%,#00EC97_100%)] text-[#171717]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-6 py-24 sm:px-8 sm:py-32">
        <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-6xl sm:leading-[1.05]">
          A brief can be open today.
        </h2>
        <p className="max-w-md text-lg">
          Apply with your name, the work you make, and a portfolio.
        </p>
        <Link
          href={routes.public.apply}
          className="rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
        >
          Apply as creator
        </Link>
      </div>
    </section>
  );
}
