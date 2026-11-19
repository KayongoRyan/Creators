import { AdminPortalGate } from "@/components/layout/AdminPortalGate";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/config/navigation";
import { AdminStoreProvider } from "@/features/admin/store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell title="Admin" role="admin" nav={adminNav}>
      <AdminStoreProvider>
        <AdminPortalGate>{children}</AdminPortalGate>
      </AdminStoreProvider>
    </DashboardShell>
  );
}
