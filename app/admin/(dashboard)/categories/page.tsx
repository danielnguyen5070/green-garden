import { Plus } from "lucide-react";
import { AdminApiUnavailable } from "@/components/admin/admin-api-unavailable";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/lib/admin-copy";

export default function AdminCategoriesPage() {
  return (
    <>
      <AdminPageHeader
        title={adminCopy.categories.title}
        description={adminCopy.categories.description}
        actions={
          <Button type="button" disabled>
            <Plus data-icon="inline-start" />
            {adminCopy.categories.add}
          </Button>
        }
      />
      <AdminApiUnavailable endpoint="GET /api/v1/categories" />
    </>
  );
}
