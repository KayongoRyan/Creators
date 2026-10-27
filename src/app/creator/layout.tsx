import { DashboardShell } from "@/components/layout/DashboardShell";
import { creatorNav } from "@/config/navigation";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Creator" nav={creatorNav}>
      {children}
    </DashboardShell>
  );
}
