import { Figtree } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/marketing";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${figtree.className} flex min-h-screen flex-col bg-white text-[#171717] antialiased selection:bg-[#00EC97] selection:text-black`}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
