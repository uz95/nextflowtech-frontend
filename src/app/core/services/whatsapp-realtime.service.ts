import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WhatsAppContact, WhatsAppMessageEvent } from '../models/whatsapp.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WhatsAppRealtimeService {
  private readonly auth = inject(AuthService);
  private connection?: signalR.HubConnection;
  private readonly hubUrl = `${environment.apiUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '')}/hubs/whatsapp-inbox`;

  private readonly newMessageSubject = new Subject<WhatsAppMessageEvent>();
  private readonly messageSentSubject = new Subject<WhatsAppMessageEvent>();
  private readonly conversationUpdatedSubject = new Subject<WhatsAppContact>();

  readonly newMessageReceived$ = this.newMessageSubject.asObservable();
  readonly messageSent$ = this.messageSentSubject.asObservable();
  readonly conversationUpdated$ = this.conversationUpdatedSubject.asObservable();

  start(): void {
    if (!this.auth.accessToken || this.connection?.state === signalR.HubConnectionState.Connected || this.connection?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => this.auth.accessToken ?? '' })
      .withAutomaticReconnect()
      .build();

    this.connection.on('NewMessageReceived', (event: WhatsAppMessageEvent) => this.newMessageSubject.next(event));
    this.connection.on('MessageSent', (event: WhatsAppMessageEvent) => this.messageSentSubject.next(event));
    this.connection.on('ConversationUpdated', (conversation: WhatsAppContact) => this.conversationUpdatedSubject.next(conversation));

    void this.connection.start().catch(() => undefined);
  }

  stop(): void {
    const connection = this.connection;
    this.connection = undefined;
    if (connection) {
      void connection.stop().catch(() => undefined);
    }
  }
}
