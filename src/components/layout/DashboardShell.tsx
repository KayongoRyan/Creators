import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type NavItem = { href: string; label: string };

type DashboardShellProps = {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
  className?: string;
};

export function DashboardShell({
  title,
  nav,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      <aside className="w-56 border-r border-neutral-200 bg-white p-4">
        <p className="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </p>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
