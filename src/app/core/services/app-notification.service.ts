import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AppNotification } from '../models/notification.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AppNotificationService {
  private readonly api = inject(ApiService);
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  list(): Observable<AppNotification[]> {
    return this.api.get<AppNotification[]>('notifications');
  }

  loadUnreadCount(): void {
    this.api.get<{ count: number }>('notifications/unread-count').subscribe((result) => this.unreadCountSubject.next(result.count));
  }

  markRead(id: string): Observable<void> {
    return this.api.put<void>(`notifications/${id}/read`, {}).pipe(tap(() => this.loadUnreadCount()));
  }

  markAllRead(): Observable<void> {
    return this.api.put<void>('notifications/read-all', {}).pipe(tap(() => this.unreadCountSubject.next(0)));
  }
}
