import Link from "next/link";
import { routes } from "@/config/routes";

export function Logo() {
  return (
    <Link
      href={routes.public.home}
      className="inline-flex items-center gap-2.5 text-mkt-fg"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--m-accent)" />
        <path
          d="M21.2 10.2a7.4 7.4 0 1 0 .2 11.7"
          fill="none"
          stroke="var(--m-on-accent)"
          strokeWidth="2.7"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-base font-semibold tracking-tight">Creators</span>
    </Link>
  );
}
