import { Plus } from "lucide-react";
import { AdminApiUnavailable } from "@/components/admin/admin-api-unavailable";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/lib/admin-copy";

export default function AdminBlogPage() {
  return (
    <>
      <AdminPageHeader
        title={adminCopy.blog.title}
        description={adminCopy.blog.description}
        actions={
          <Button type="button" disabled>
            <Plus data-icon="inline-start" />
            {adminCopy.blog.add}
          </Button>
        }
      />
      <AdminApiUnavailable endpoint="GET /api/v1/blog" />
    </>
  );
}
