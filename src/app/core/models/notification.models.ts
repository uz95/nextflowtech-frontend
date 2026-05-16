export type AppNotificationType =
  | 'InvoiceDue'
  | 'InvoiceOverdue'
  | 'PaymentReceived'
  | 'LowStock'
  | 'SubscriptionExpiring'
  | 'System';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: AppNotificationType;
  isRead: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  createdAt: string;
}
