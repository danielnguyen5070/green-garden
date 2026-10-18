import { AdminPageHeader } from "@/app/admin/_components/admin-page-header";
import { AdminSection } from "@/app/admin/_components/admin-section";
import { adminCopy } from "@/app/admin/_lib/admin-copy";

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
