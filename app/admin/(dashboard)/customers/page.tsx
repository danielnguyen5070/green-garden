import { AdminApiUnavailable } from "@/components/admin/admin-api-unavailable";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminCopy } from "@/lib/admin-copy";

export default function AdminCustomersPage() {
  return (
    <>
      <AdminPageHeader
        title={adminCopy.customers.title}
        description={adminCopy.customers.description}
      />
      <AdminApiUnavailable endpoint="GET /api/v1/customers" />
    </>
  );
}
