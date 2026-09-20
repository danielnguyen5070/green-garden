/**
 * Admin notification shapes from `GET /api/v1/notifications`.
 */

export type NotificationType = "new_order" | (string & {});

export type AdminNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  /** Related entity id (e.g. order id for `new_order`). */
  entity_id: string | null;
  entity_type?: string | null;
  created_at: string;
  read_at?: string | null;
  updated_at?: string;
};

export type NotificationListResponse = {
  items: AdminNotification[];
  page: number;
  page_size: number;
  total: number;
  /** Present when the API returns a dedicated unread total. */
  unread_count?: number;
};
