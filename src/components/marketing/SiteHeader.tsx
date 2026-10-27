import Link from "next/link";
import { routes } from "@/config/routes";
import { marketingType } from "@/lib/marketing";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-transparent bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 sm:px-8">
        <Logo />
        <Link href={routes.auth.login} className={marketingType.navLink}>
          Log in
        </Link>
      </div>
    </header>
  );
}
