import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import {
  AdminRowActions,
  AdminToolbar,
} from "@/components/admin/admin-toolbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import plantsData from "@/data/admin/plants.json";
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin-format";
import type { AdminPlant } from "@/types/admin";

export default function AdminPlantsPage() {
  const plants = plantsData as AdminPlant[];
  const categories = [...new Set(plants.map((plant) => plant.category))];

  return (
    <>
      <AdminPageHeader
        title={adminCopy.plants.title}
        description={adminCopy.plants.description}
        actions={
          <Button type="button">
            <Plus data-icon="inline-start" />
            {adminCopy.plants.add}
          </Button>
        }
      />

      <AdminSection
        title={adminCopy.plants.title}
        contentClassName="space-y-4"
      >
        <AdminToolbar
          searchPlaceholder={adminCopy.plants.searchPlaceholder}
          showCategoryFilter
          showStatusFilter
          categoryOptions={categories}
          statusOptions={["active", "draft", "low_stock", "out_of_stock"]}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.plants.table.plant}</TableHead>
              <TableHead>{adminCopy.plants.table.category}</TableHead>
              <TableHead className="text-right">
                {adminCopy.plants.table.price}
              </TableHead>
              <TableHead className="text-right">
                {adminCopy.plants.table.stock}
              </TableHead>
              <TableHead>{adminCopy.plants.table.status}</TableHead>
              <TableHead>{adminCopy.plants.table.updated}</TableHead>
              <TableHead className="text-right">
                {adminCopy.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plants.map((plant) => (
              <TableRow key={plant.id}>
                <TableCell className="font-medium">{plant.name}</TableCell>
                <TableCell>{plant.category}</TableCell>
                <TableCell className="text-right">
                  {formatAdminCurrency(plant.price)}
                </TableCell>
                <TableCell className="text-right">{plant.stock}</TableCell>
                <TableCell>
                  <AdminStatusBadge
                    status={plant.status}
                    label={adminCopy.status[plant.status]}
                  />
                </TableCell>
                <TableCell>{formatAdminDate(plant.updated)}</TableCell>
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
