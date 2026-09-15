import { AdminApiUnavailable } from "@/components/admin/admin-api-unavailable";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin-copy";

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title={adminCopy.orders.title}
        description={adminCopy.orders.description}
      />
      <AdminApiUnavailable endpoint="GET /api/v1/orders" />
    </>
  );
}
