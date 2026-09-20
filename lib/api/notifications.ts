import { api } from "@/lib/api/client";
import type { MessageResponse } from "@/types/auth";
import type {
  AdminNotification,
  NotificationListResponse,
} from "@/types/notification";

export type ListNotificationsParams = {
  page?: number;
  page_size?: number;
  /** When true, only unread notifications. */
  unread?: boolean;
};

export async function listNotifications(
  params: ListNotificationsParams = {},
  options: { signal?: AbortSignal } = {}
): Promise<NotificationListResponse> {
  return api.get<NotificationListResponse>("/notifications", {
    signal: options.signal,
    query: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
      unread: params.unread,
    },
  });
}

export async function markNotificationRead(
  id: string
): Promise<AdminNotification> {
  return api.patch<AdminNotification>(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<MessageResponse> {
  return api.patch<MessageResponse>("/notifications/read-all");
}
