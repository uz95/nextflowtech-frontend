import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { WhatsAppRealtimeService } from '../../core/services/whatsapp-realtime.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { WhatsAppContact, WhatsAppConversationStatus, WhatsAppMessage, WhatsAppQuickReply } from '../../core/models/whatsapp.models';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    MatBadgeModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(NotificationService);
  private readonly realtime = inject(WhatsAppRealtimeService);
  private readonly whatsApp = inject(WhatsAppService);

  readonly search = new FormControl('', { nonNullable: true });
  readonly statusFilter = new FormControl<WhatsAppConversationStatus | ''>('', { nonNullable: true });
  readonly messageText = new FormControl('', { nonNullable: true });
  readonly statuses: (WhatsAppConversationStatus | '')[] = ['', 'Open', 'Pending', 'Closed'];

  conversations: WhatsAppContact[] = [];
  messages: WhatsAppMessage[] = [];
  quickReplies: WhatsAppQuickReply[] = [];
  selected?: WhatsAppContact;
  loadingConversations = false;
  loadingMessages = false;
  sending = false;

  ngOnInit(): void {
    this.realtime.start();
    this.loadConversations();
    this.loadQuickReplies();

    this.search.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadConversations());

    this.statusFilter.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadConversations());

    this.realtime.newMessageReceived$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.upsertConversation(event.conversation);
        if (this.selected?.id === event.conversation.id) {
          this.appendMessage(event.message);
          this.markRead(event.conversation.id);
        }
      });

    this.realtime.messageSent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.upsertConversation(event.conversation);
        if (this.selected?.id === event.conversation.id) {
          this.appendMessage(event.message);
        }
      });

    this.realtime.conversationUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((conversation) => this.upsertConversation(conversation));
  }

  loadConversations(): void {
    this.loadingConversations = true;
    this.whatsApp.conversations({
      page: 1,
      pageSize: 50,
      search: this.search.value,
      status: this.statusFilter.value
    }).pipe(finalize(() => (this.loadingConversations = false))).subscribe((result) => {
      this.conversations = result.items;
      if (this.selected) {
        this.selected = this.conversations.find((x) => x.id === this.selected?.id) ?? this.selected;
      }
    });
  }

  loadQuickReplies(): void {
    this.whatsApp.quickReplies(true).subscribe((items) => (this.quickReplies = items));
  }

  openConversation(conversation: WhatsAppContact): void {
    this.selected = conversation;
    this.loadingMessages = true;
    this.messages = [];
    this.whatsApp.messages(conversation.id)
      .pipe(finalize(() => (this.loadingMessages = false)))
      .subscribe((messages) => {
        this.messages = messages;
        if (conversation.unreadCount > 0) {
          this.markRead(conversation.id);
        }
      });
  }

  send(): void {
    const text = this.messageText.value.trim();
    if (!this.selected || !text || this.sending) {
      return;
    }

    this.sending = true;
    this.whatsApp.sendMessage(this.selected.id, { text })
      .pipe(finalize(() => (this.sending = false)))
      .subscribe((message) => {
        this.messageText.setValue('');
        this.appendMessage(message);
        if (message.status === 'Failed') {
          this.notifications.error('WhatsApp could not send this message. Check the account token and phone number.');
        }
      });
  }

  insertQuickReply(reply: WhatsAppQuickReply): void {
    this.messageText.setValue(reply.message);
  }

  changeStatus(status: WhatsAppConversationStatus): void {
    if (!this.selected || this.selected.status === status) {
      return;
    }

    this.whatsApp.updateStatus(this.selected.id, { status }).subscribe((conversation) => this.upsertConversation(conversation));
  }

  assignToMe(): void {
    if (!this.selected || !this.auth.currentUser?.userId) {
      return;
    }

    this.whatsApp.assign(this.selected.id, { assignedUserId: this.auth.currentUser.userId })
      .subscribe((conversation) => this.upsertConversation(conversation));
  }

  unassign(): void {
    if (!this.selected) {
      return;
    }

    this.whatsApp.assign(this.selected.id, { assignedUserId: null })
      .subscribe((conversation) => this.upsertConversation(conversation));
  }

  private markRead(contactId: string): void {
    this.whatsApp.markRead(contactId).subscribe((conversation) => this.upsertConversation(conversation));
  }

  private appendMessage(message: WhatsAppMessage): void {
    if (this.messages.some((x) => x.id === message.id)) {
      return;
    }

    this.messages = [...this.messages, message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  private upsertConversation(conversation: WhatsAppContact): void {
    const index = this.conversations.findIndex((x) => x.id === conversation.id);
    this.conversations = index >= 0
      ? this.conversations.map((item) => item.id === conversation.id ? conversation : item)
      : [conversation, ...this.conversations];
    this.conversations = [...this.conversations].sort((a, b) =>
      new Date(b.lastMessageAt ?? b.updatedAt).getTime() - new Date(a.lastMessageAt ?? a.updatedAt).getTime());

    if (this.selected?.id === conversation.id) {
      this.selected = conversation;
    }
  }
}
