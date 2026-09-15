import { AdminSection } from "@/components/admin/admin-section";
import { adminCopy } from "@/lib/admin-copy";

type AdminApiUnavailableProps = {
  endpoint: string;
  title?: string;
};

function AdminApiUnavailable({
  endpoint,
  title = adminCopy.common.apiUnavailable,
}: AdminApiUnavailableProps) {
  return (
    <AdminSection title={title}>
      <p className="text-sm text-muted-foreground">
        {adminCopy.common.apiUnavailableDescription(endpoint)}
      </p>
    </AdminSection>
  );
}

export { AdminApiUnavailable };
