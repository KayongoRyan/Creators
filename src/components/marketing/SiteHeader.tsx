import Link from "next/link";
import { routes } from "@/config/routes";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-transparent bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 sm:px-8">
        <Logo />
        <Link
          href={routes.auth.login}
          className="rounded-lg px-3 py-2 text-sm font-medium text-[#171717] hover:bg-black/5"
        >
          Log in
        </Link>
      </div>
    </header>
  );
}
