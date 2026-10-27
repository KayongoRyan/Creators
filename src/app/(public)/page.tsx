import Link from "next/link";
import {
  ClosingCta,
  FaqList,
  FeatureList,
  Principles,
  WorkspacePreview,
} from "@/components/marketing";
import { routes } from "@/config/routes";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl border-x border-black/[0.08]">
        <div className="flex flex-col items-start gap-6 px-6 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-24">
          <h1 className="max-w-4xl text-4xl font-medium leading-[1.12] tracking-tight sm:text-6xl sm:leading-[1.05] sm:tracking-[-0.03em]">
            Campaigns, creators, and the work between them.
          </h1>
          <p className="max-w-xl text-lg leading-7 text-neutral-600">
            Brands post the brief. Creators apply. The cut and the stills come
            back on that same campaign.
          </p>
          <Link
            href={routes.public.apply}
            className="rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            Apply as creator
          </Link>
          <p className="text-sm text-neutral-500">
            A name, a niche, and a portfolio. Someone reviews it.
          </p>
        </div>
        <div className="px-6 pb-20 sm:px-8">
          <p className="mb-4 text-sm text-neutral-500">The workspace.</p>
          <WorkspacePreview />
        </div>
      </section>
      <FeatureList />
      <Principles />
      <FaqList />
      <ClosingCta />
    </>
  );
}
