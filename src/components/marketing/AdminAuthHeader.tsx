import { Logo } from "./Logo";

/** Minimal header on `dev:admin` — no Creators/Business nav. */
export function AdminAuthHeader() {
  return (
    <header className="sticky left-0 right-0 top-0 z-40 border-b border-black/10 bg-mkt-bg/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[3.75rem] max-w-[90rem] items-center px-4 sm:min-h-[4.5rem] sm:px-6 lg:px-10">
        <Logo variant="wordmark" className="shrink-0 text-mkt-fg" />
        <p className="ml-4 hidden text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 sm:block">
          Admin console
        </p>
      </div>
    </header>
  );
}