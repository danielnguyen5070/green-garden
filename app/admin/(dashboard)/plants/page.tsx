import { Plus } from "lucide-react";
import { AdminApiUnavailable } from "@/components/admin/admin-api-unavailable";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/lib/admin-copy";

export default function AdminPlantsPage() {
  return (
    <>
      <AdminPageHeader
        title={adminCopy.plants.title}
        description={adminCopy.plants.description}
        actions={
          <Button type="button" disabled>
            <Plus data-icon="inline-start" />
            {adminCopy.plants.add}
          </Button>
        }
      />
      <AdminApiUnavailable endpoint="GET /api/v1/plants" />
    </>
  );
}
