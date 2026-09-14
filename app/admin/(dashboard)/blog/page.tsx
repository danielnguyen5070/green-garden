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
import blogData from "@/data/admin/blog.json";
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminDate } from "@/lib/admin-format";
import type { AdminBlogPost } from "@/types/admin";

export default function AdminBlogPage() {
  const posts = blogData as AdminBlogPost[];

  return (
    <>
      <AdminPageHeader
        title={adminCopy.blog.title}
        description={adminCopy.blog.description}
        actions={
          <Button type="button">
            <Plus data-icon="inline-start" />
            {adminCopy.blog.add}
          </Button>
        }
      />

      <AdminSection title={adminCopy.blog.title} contentClassName="space-y-4">
        <AdminToolbar
          searchPlaceholder={adminCopy.blog.searchPlaceholder}
          showStatusFilter
          statusOptions={["published", "draft", "scheduled"]}
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{adminCopy.blog.table.title}</TableHead>
              <TableHead>{adminCopy.blog.table.status}</TableHead>
              <TableHead>{adminCopy.blog.table.author}</TableHead>
              <TableHead>{adminCopy.blog.table.published}</TableHead>
              <TableHead>{adminCopy.blog.table.updated}</TableHead>
              <TableHead className="text-right">
                {adminCopy.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-72 truncate font-medium">
                  {post.title}
                </TableCell>
                <TableCell>
                  <AdminStatusBadge
                    status={post.status}
                    label={adminCopy.status[post.status]}
                  />
                </TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>
                  {post.published
                    ? formatAdminDate(post.published)
                    : adminCopy.blog.unpublished}
                </TableCell>
                <TableCell>{formatAdminDate(post.updated)}</TableCell>
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
