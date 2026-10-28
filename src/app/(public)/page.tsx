import dynamic from "next/dynamic";
import Link from "next/link";
import { ClosingCta } from "@/components/marketing/ClosingCta";
import { FaqList } from "@/components/marketing/FaqList";
import { FeatureList } from "@/components/marketing/FeatureList";
import { Principles } from "@/components/marketing/Principles";
import { marketingFrame, marketingType } from "@/lib/marketing";
import { routes } from "@/config/routes";

const WorkspacePreview = dynamic(
  () =>
    import("@/components/marketing/WorkspacePreview").then(
      (mod) => mod.WorkspacePreview,
    ),
  { ssr: true },
);

export default function HomePage() {
  return (
    <>
      <section className={`mx-auto w-full max-w-7xl ${marketingFrame}`}>
        <div className="flex min-h-[62vh] flex-col items-center justify-center px-6 py-20 text-center sm:px-8 sm:py-24">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            Creator campaigns, connected
          </p>
          <h1 className={`max-w-5xl ${marketingType.hero}`}>
            Campaigns, creators, and the work between them.
          </h1>
          <p className={`mt-6 max-w-2xl ${marketingType.body}`}>
            Brands post the brief. Creators apply. The cut and the stills come
            back on that same campaign.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={routes.public.apply}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-gray-900 px-6 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Apply as creator
            </Link>
            <a
              href="#workspace"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/15 px-6 text-sm font-medium text-gray-900 transition-colors hover:border-black/30 hover:bg-black/[0.03]"
            >
              Explore the workspace
            </a>
          </div>
        </div>
        <div id="workspace" className="scroll-mt-20 px-6 pb-20 sm:px-8">
          <p className={marketingType.eyebrow}>The workspace.</p>
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
