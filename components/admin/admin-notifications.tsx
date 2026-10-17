"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminCopy } from "@/lib/admin-copy";
import { formatAdminRelativeTime } from "@/lib/admin-format";
import { getErrorMessage } from "@/lib/api/errors";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/lib/toast";
import type { AdminNotification } from "@/types/notification";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 60_000;

const copy = adminCopy.topbar;

function unreadFromList(
  items: AdminNotification[],
  apiUnread?: number
): number {
  if (typeof apiUnread === "number" && Number.isFinite(apiUnread)) {
    return Math.max(0, apiUnread);
  }
  return items.reduce((count, item) => count + (item.is_read ? 0 : 1), 0);
}

function AdminNotifications({ className }: { className?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const notificationsQuery = useQuery({
    queryKey: queryKeys.admin.notifications,
    queryFn: async ({ signal }) => {
      const response = await listNotifications(
        { page: 1, page_size: PAGE_SIZE },
        { signal }
      );
      return {
        items: response.items,
        unreadCount: unreadFromList(response.items, response.unread_count),
      };
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const items = notificationsQuery.data?.items ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.setQueryData(
        queryKeys.admin.notifications,
        (current: { items: AdminNotification[]; unreadCount: number } | undefined) => {
          if (!current) return current;
          return {
            items: current.items.map((item) =>
              item.is_read ? item : { ...item, is_read: true }
            ),
            unreadCount: 0,
          };
        }
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (notification: AdminNotification) =>
      markNotificationRead(notification.id),
    onMutate: async (notification) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.admin.notifications,
      });
      const previous = queryClient.getQueryData<{
        items: AdminNotification[];
        unreadCount: number;
      }>(queryKeys.admin.notifications);

      queryClient.setQueryData(
        queryKeys.admin.notifications,
        (current: { items: AdminNotification[]; unreadCount: number } | undefined) => {
          if (!current) return current;
          return {
            items: current.items.map((item) =>
              item.id === notification.id ? { ...item, is_read: true } : item
            ),
            unreadCount: Math.max(0, current.unreadCount - 1),
          };
        }
      );

      return { previous };
    },
    onError: (error, _notification, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.admin.notifications,
          context.previous
        );
      }
      toast.error(getErrorMessage(error));
    },
  });

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;

    try {
      await notificationsQuery.refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, copy.loadError));
    }
  }

  async function handleMarkAllAsRead() {
    if (markAllMutation.isPending || unreadCount === 0) return;
    markAllMutation.mutate();
  }

  async function handleNotificationClick(notification: AdminNotification) {
    if (!notification.is_read) {
      try {
        await markOneMutation.mutateAsync(notification);
      } catch {
        return;
      }
    }

    setOpen(false);

    if (notification.type === "new_order" && notification.entity_id) {
      router.push(
        `/admin/orders?order=${encodeURIComponent(notification.entity_id)}`
      );
    }
  }

  const loading = notificationsQuery.isFetching && items.length === 0;
  const markingAll = markAllMutation.isPending;
  const badgeLabel =
    unreadCount > 0 ? copy.unreadCount(unreadCount) : undefined;
  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <div className={cn("relative", className)}>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                badgeLabel
                  ? `${copy.notifications}, ${badgeLabel}`
                  : copy.notifications
              }
            />
          }
        >
          <Bell className="size-4" />
        </DropdownMenuTrigger>
        {unreadCount > 0 ? (
          <span
            className="pointer-events-none absolute top-0 right-0 z-10 flex h-3.5 min-w-3.5 translate-x-0.5 -translate-y-0.5 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] leading-none font-semibold text-white"
            aria-hidden="true"
          >
            {badgeText}
          </span>
        ) : null}
      </div>

      <DropdownMenuContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold text-foreground">
            {copy.notifications}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={markingAll || unreadCount === 0 || loading}
            onClick={(event) => {
              event.preventDefault();
              void handleMarkAllAsRead();
            }}
          >
            {copy.markAllAsRead}
          </Button>
        </div>

        <DropdownMenuGroup className="max-h-80 overflow-y-auto p-1">
          {loading && items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {adminCopy.common.loading}
            </p>
          ) : items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {copy.noNotifications}
            </p>
          ) : (
            items.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2.5",
                  !notification.is_read && "bg-primary/5"
                )}
                onClick={() => {
                  void handleNotificationClick(notification);
                }}
              >
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    notification.is_read
                      ? "bg-transparent"
                      : "bg-primary"
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {notification.title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                    {notification.message}
                  </span>
                  <span className="mt-1 block text-[0.6875rem] text-muted-foreground">
                    {formatAdminRelativeTime(notification.created_at)}
                  </span>
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AdminNotifications };
