"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await listNotifications(
        { page: 1, page_size: PAGE_SIZE },
        { signal }
      );
      if (signal?.aborted) return;
      setItems(response.items);
      setUnreadCount(unreadFromList(response.items, response.unread_count));
    } catch (error) {
      if (signal?.aborted) return;
      // Quiet on background poll; surface errors when the user opens the menu.
      throw error;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetchNotifications(controller.signal).catch(() => {
      // Initial badge fetch failures stay silent until the dropdown opens.
    });

    const interval = window.setInterval(() => {
      void fetchNotifications().catch(() => {
        // Ignore transient poll errors.
      });
    }, POLL_INTERVAL_MS);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [fetchNotifications]);

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;

    setLoading(true);
    try {
      await fetchNotifications();
    } catch (error) {
      toast.error(getErrorMessage(error, copy.loadError));
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllAsRead() {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((current) =>
        current.map((item) =>
          item.is_read ? item : { ...item, is_read: true }
        )
      );
      setUnreadCount(0);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleNotificationClick(notification: AdminNotification) {
    if (!notification.is_read) {
      // Optimistic local update so the badge clears immediately.
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await markNotificationRead(notification.id);
      } catch (error) {
        setItems((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, is_read: false } : item
          )
        );
        setUnreadCount((count) => count + 1);
        toast.error(getErrorMessage(error));
        return;
      }
    }

    setOpen(false);

    if (notification.type === "new_order" && notification.entity_id) {
      router.push(`/admin/orders?order=${encodeURIComponent(notification.entity_id)}`);
    }
  }

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
