import { AdminPortalGate } from "@/components/layout/AdminPortalGate";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/config/navigation";
import { AdminStoreProvider } from "@/features/admin/store";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminStoreProvider>
      <AdminPortalGate>
        <DashboardShell title="Admin" role="admin" nav={adminNav}>
          {children}
        </DashboardShell>
      </AdminPortalGate>
    </AdminStoreProvider>
  );
}
