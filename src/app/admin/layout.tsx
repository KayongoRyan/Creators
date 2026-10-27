import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/config/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Admin" nav={adminNav}>
      {children}
    </DashboardShell>
  );
}
