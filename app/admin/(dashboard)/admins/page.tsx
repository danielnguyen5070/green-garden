"use client";

import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createAdmin,
  listAdmins,
  updateAdmin,
  updateAdminPassword,
  updateAdminStatus,
} from "@/lib/api/admins";
import { getErrorMessage } from "@/lib/api/errors";
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminDate } from "@/lib/admin-format";
import { toast } from "@/lib/toast";
import type { Admin } from "@/types/admin";

const PAGE_SIZE = 20;

type DialogMode = "create" | "edit" | "password" | null;

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<Admin | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAdmins() {
      try {
        const response = await listAdmins({
          page,
          page_size: PAGE_SIZE,
        });
        if (controller.signal.aborted) return;
        setAdmins(response.items);
        setTotal(response.total);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchAdmins();
    return () => controller.abort();
  }, [page, reloadToken]);

  function refresh(nextPage = page) {
    setLoading(true);
    setPage(nextPage);
    setReloadToken((token) => token + 1);
  }

  function openCreate() {
    setSelected(null);
    setDialogMode("create");
  }

  function openEdit(admin: Admin) {
    setSelected(admin);
    setDialogMode("edit");
  }

  function openPassword(admin: Admin) {
    setSelected(admin);
    setDialogMode("password");
  }

  function closeDialog() {
    if (submitting) return;
    setDialogMode(null);
    setSelected(null);
  }

  async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      await createAdmin({
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });
      setDialogMode(null);
      toast.success(adminCopy.admins.createdSuccess);
      refresh(1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      await updateAdmin(selected.id, {
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
      });
      setDialogMode(null);
      toast.success(adminCopy.admins.updatedSuccess);
      refresh(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePassword(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      const result = await updateAdminPassword(selected.id, {
        password: String(formData.get("password") ?? ""),
      });
      setDialogMode(null);
      toast.success(result.message || adminCopy.admins.passwordSuccess);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(admin: Admin) {
    try {
      await updateAdminStatus(admin.id, { is_active: !admin.is_active });
      toast.success(adminCopy.admins.statusSuccess);
      refresh(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <>
      <AdminPageHeader
        description={adminCopy.admins.description}
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus data-icon="inline-start" />
            {adminCopy.admins.add}
          </Button>
        }
      />

      <AdminSection contentClassName="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">{adminCopy.common.loading}</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-muted-foreground">{adminCopy.admins.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{adminCopy.admins.table.name}</TableHead>
                <TableHead>{adminCopy.admins.table.email}</TableHead>
                <TableHead>{adminCopy.admins.table.status}</TableHead>
                <TableHead>{adminCopy.admins.table.created}</TableHead>
                <TableHead>{adminCopy.admins.table.updated}</TableHead>
                <TableHead className="text-right">
                  {adminCopy.common.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <AdminStatusBadge
                      status={admin.is_active ? "active" : "inactive"}
                      label={
                        admin.is_active
                          ? adminCopy.status.active
                          : adminCopy.status.inactive
                      }
                    />
                  </TableCell>
                  <TableCell>{formatAdminDate(admin.created_at)}</TableCell>
                  <TableCell>{formatAdminDate(admin.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={adminCopy.common.actions}
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openEdit(admin)}
                        >
                          {adminCopy.common.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => openPassword(admin)}
                        >
                          {adminCopy.admins.changePassword}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            void handleToggleStatus(admin);
                          }}
                        >
                          {admin.is_active
                            ? adminCopy.admins.deactivate
                            : adminCopy.admins.activate}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!loading && total > 0 ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {adminCopy.admins.pageInfo(page, totalPages, total)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => refresh(page - 1)}
              >
                {adminCopy.common.previous}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => refresh(page + 1)}
              >
                {adminCopy.common.next}
              </Button>
            </div>
          </div>
        ) : null}
      </AdminSection>

      <Dialog
        open={dialogMode === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{adminCopy.admins.createTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">{adminCopy.admins.name}</Label>
              <Input
                id="create-name"
                name="name"
                required
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">{adminCopy.admins.email}</Label>
              <Input
                id="create-email"
                name="email"
                type="email"
                required
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">{adminCopy.admins.password}</Label>
              <Input
                id="create-password"
                name="password"
                type="password"
                required
                minLength={8}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={submitting}
                onClick={closeDialog}
              >
                {adminCopy.common.cancel}
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-full w-24">
                {submitting ? adminCopy.common.saving : adminCopy.common.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "edit"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{adminCopy.admins.editTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{adminCopy.admins.name}</Label>
              <Input
                id="edit-name"
                name="name"
                required
                defaultValue={selected?.name}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{adminCopy.admins.email}</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                required
                defaultValue={selected?.email}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={submitting}
                onClick={closeDialog}
              >
                {adminCopy.common.cancel}
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-full w-24">
                {submitting ? adminCopy.common.saving : adminCopy.common.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "password"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="mt-2">
              {adminCopy.admins.passwordTitle}
            </DialogTitle>
            <DialogDescription>
              {selected ? selected.email : null}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password-new">{adminCopy.admins.newPassword}</Label>
              <Input
                id="password-new"
                name="password"
                type="password"
                required
                minLength={8}
                disabled={submitting}
                className="h-11 rounded-full"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={submitting}
                onClick={closeDialog}
              >
                {adminCopy.common.cancel}
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-full w-24">
                {submitting ? adminCopy.common.saving : adminCopy.common.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
