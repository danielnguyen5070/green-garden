import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { adminCopy } from "@/lib/admin-copy";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        title={adminCopy.settings.title}
        description={adminCopy.settings.description}
      />
      <AdminSection title={adminCopy.common.comingSoon}>
        <p className="text-sm text-muted-foreground">
          {adminCopy.common.placeholderDescription}
        </p>
      </AdminSection>
    </>
  );
}
