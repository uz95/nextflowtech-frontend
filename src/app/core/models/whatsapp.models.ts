import { QueryParams } from './api.models';

export type WhatsAppConversationStatus = 'Open' | 'Pending' | 'Closed';
export type WhatsAppMessageDirection = 'Incoming' | 'Outgoing';
export type WhatsAppMessageType = 'Text' | 'Image' | 'Document' | 'Audio' | 'Video' | 'Unknown';
export type WhatsAppMessageStatus = 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Received';

export interface WhatsAppAccount {
  id: string;
  displayName: string;
  phoneNumber?: string | null;
  phoneNumberId: string;
  whatsAppBusinessAccountId: string;
  hasAccessToken: boolean;
  hasWebhookVerifyToken: boolean;
  accessTokenMasked?: string | null;
  webhookVerifyTokenMasked?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminWhatsAppAccount {
  id: string;
  businessId: string;
  businessName: string;
  displayName: string;
  phoneNumber?: string | null;
  phoneNumberId: string;
  whatsAppBusinessAccountId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertWhatsAppAccountRequest {
  displayName?: string | null;
  phoneNumber?: string | null;
  phoneNumberId: string;
  whatsAppBusinessAccountId: string;
  accessToken?: string | null;
  webhookVerifyToken?: string | null;
  isActive: boolean;
}

export interface WhatsAppConversationQueryParams extends QueryParams {
  status?: WhatsAppConversationStatus | '';
}

export interface WhatsAppContact {
  id: string;
  customerId?: string | null;
  name: string;
  phoneNumber: string;
  whatsAppId: string;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
  status: WhatsAppConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  whatsAppContactId: string;
  direction: WhatsAppMessageDirection;
  messageType: WhatsAppMessageType;
  text?: string | null;
  mediaUrl?: string | null;
  whatsAppMessageId?: string | null;
  status: WhatsAppMessageStatus;
  sentByUserId?: string | null;
  sentByUserName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendWhatsAppMessageRequest {
  text: string;
}

export interface UpdateWhatsAppConversationStatusRequest {
  status: WhatsAppConversationStatus;
}

export interface AssignWhatsAppConversationRequest {
  assignedUserId?: string | null;
}

export interface WhatsAppQuickReply {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertWhatsAppQuickReplyRequest {
  title: string;
  message: string;
  isActive: boolean;
}

export interface WhatsAppMessageEvent {
  message: WhatsAppMessage;
  conversation: WhatsAppContact;
}
