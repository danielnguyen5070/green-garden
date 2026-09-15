import { AdminApiUnavailable } from "@/components/admin/admin-api-unavailable";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin-copy";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        title={adminCopy.dashboard.title}
        description={adminCopy.dashboard.description}
      />
      <AdminApiUnavailable endpoint="GET /api/v1/admin/dashboard/overview" />
    </>
  );
}
