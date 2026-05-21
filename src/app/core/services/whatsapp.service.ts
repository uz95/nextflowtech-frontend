import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/api.models';
import {
  AssignWhatsAppConversationRequest,
  SendWhatsAppMessageRequest,
  UpdateWhatsAppConversationStatusRequest,
  UpsertWhatsAppAccountRequest,
  UpsertWhatsAppQuickReplyRequest,
  WhatsAppAccount,
  WhatsAppContact,
  WhatsAppConversationQueryParams,
  WhatsAppMessage,
  WhatsAppQuickReply
} from '../models/whatsapp.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private readonly api = inject(ApiService);

  getAccount(): Observable<WhatsAppAccount | null> {
    return this.api.get<WhatsAppAccount | null>('whatsapp/account');
  }

  upsertAccount(request: UpsertWhatsAppAccountRequest): Observable<WhatsAppAccount> {
    return this.api.put<WhatsAppAccount>('whatsapp/account', request);
  }

  conversations(params?: WhatsAppConversationQueryParams): Observable<PagedResult<WhatsAppContact>> {
    return this.api.get<PagedResult<WhatsAppContact>>('whatsapp/conversations', params);
  }

  messages(contactId: string): Observable<WhatsAppMessage[]> {
    return this.api.get<WhatsAppMessage[]>(`whatsapp/conversations/${contactId}/messages`);
  }

  sendMessage(contactId: string, request: SendWhatsAppMessageRequest): Observable<WhatsAppMessage> {
    return this.api.post<WhatsAppMessage>(`whatsapp/conversations/${contactId}/messages`, request);
  }

  markRead(contactId: string): Observable<WhatsAppContact> {
    return this.api.post<WhatsAppContact>(`whatsapp/conversations/${contactId}/read`, {});
  }

  updateStatus(contactId: string, request: UpdateWhatsAppConversationStatusRequest): Observable<WhatsAppContact> {
    return this.api.put<WhatsAppContact>(`whatsapp/conversations/${contactId}/status`, request);
  }

  assign(contactId: string, request: AssignWhatsAppConversationRequest): Observable<WhatsAppContact> {
    return this.api.put<WhatsAppContact>(`whatsapp/conversations/${contactId}/assignment`, request);
  }

  quickReplies(activeOnly = false): Observable<WhatsAppQuickReply[]> {
    return this.api.get<WhatsAppQuickReply[]>('whatsapp/quick-replies', { activeOnly });
  }

  createQuickReply(request: UpsertWhatsAppQuickReplyRequest): Observable<WhatsAppQuickReply> {
    return this.api.post<WhatsAppQuickReply>('whatsapp/quick-replies', request);
  }

  updateQuickReply(id: string, request: UpsertWhatsAppQuickReplyRequest): Observable<WhatsAppQuickReply> {
    return this.api.put<WhatsAppQuickReply>(`whatsapp/quick-replies/${id}`, request);
  }

  deleteQuickReply(id: string): Observable<void> {
    return this.api.delete<void>(`whatsapp/quick-replies/${id}`);
  }
}
