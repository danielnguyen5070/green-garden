import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminRowActions } from "@/components/admin/admin-toolbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import categoriesData from "@/data/admin/categories.json";
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminDate } from "@/lib/admin-format";
import type { AdminCategory } from "@/types/admin";

export default function AdminCategoriesPage() {
  const categories = categoriesData as AdminCategory[];

  return (
    <>
      <AdminPageHeader
        title={adminCopy.categories.title}
        description={adminCopy.categories.description}
        actions={
          <Button type="button">
            <Plus data-icon="inline-start" />
            {adminCopy.categories.add}
          </Button>
        }
      />

      <AdminSection title={adminCopy.categories.title}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.categories.table.category}</TableHead>
              <TableHead className="text-right">
                {adminCopy.categories.table.plants}
              </TableHead>
              <TableHead>{adminCopy.categories.table.status}</TableHead>
              <TableHead>{adminCopy.categories.table.updated}</TableHead>
              <TableHead className="text-right">
                {adminCopy.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-right">
                  {category.plantCount}
                </TableCell>
                <TableCell>
                  <AdminStatusBadge
                    status={category.status}
                    label={adminCopy.status[category.status]}
                  />
                </TableCell>
                <TableCell>{formatAdminDate(category.updated)}</TableCell>
                <TableCell className="text-right">
                  <AdminRowActions />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminSection>
    </>
  );
}
