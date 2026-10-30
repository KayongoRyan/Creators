/** Shared marketing layout tokens (viewport + safe-area aware). */

export const mktSafeX =
  "px-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))]";

export const mktSafeXWide =
  "px-[max(1.25rem,env(safe-area-inset-left,0px))] pr-[max(1.25rem,env(safe-area-inset-right,0px))] sm:px-8 lg:px-10";

export const mktSectionY = "py-14 sm:py-16 lg:py-20";

export const mktContainer = "mx-auto w-full max-w-6xl";

export const mktPageTitle =
  "text-balance text-[clamp(1.75rem,6.5vw,3.75rem)] font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl";

export const mktSectionTitle =
  "text-balance text-[clamp(1.625rem,4.5vw,2.25rem)] font-semibold tracking-tight sm:text-4xl";
