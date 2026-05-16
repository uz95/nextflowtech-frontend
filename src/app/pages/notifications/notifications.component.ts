import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AppNotification } from '../../core/models/notification.models';
import { AppNotificationService } from '../../core/services/app-notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe, NgClass, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(AppNotificationService);
  items: AppNotification[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.notificationsService.list().subscribe((items) => (this.items = items));
    this.notificationsService.loadUnreadCount();
  }

  markRead(notification: AppNotification): void {
    this.notificationsService.markRead(notification.id).subscribe(() => this.load());
  }

  markAllRead(): void {
    this.notificationsService.markAllRead().subscribe(() => this.load());
  }
}
