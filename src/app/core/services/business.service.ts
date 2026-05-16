import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BusinessProfile, SubscriptionStatus, UpdateBusinessProfileRequest } from '../models/business.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly api = inject(ApiService);
  private readonly profileSubject = new BehaviorSubject<BusinessProfile | null>(null);

  readonly profile$ = this.profileSubject.asObservable();

  getProfile(): Observable<BusinessProfile> {
    return this.api.get<BusinessProfile>('business-profile').pipe(tap((profile) => this.profileSubject.next(profile)));
  }

  updateProfile(request: UpdateBusinessProfileRequest): Observable<BusinessProfile> {
    return this.api.put<BusinessProfile>('business-profile', request).pipe(tap((profile) => this.profileSubject.next(profile)));
  }

  uploadLogo(file: File): Observable<BusinessProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postForm<BusinessProfile>('business-profile/logo', formData).pipe(tap((profile) => this.profileSubject.next(profile)));
  }

  subscriptionStatus(): Observable<SubscriptionStatus> {
    return this.api.get<SubscriptionStatus>('subscriptions/status');
  }

  publicLogoUrl(logoUrl?: string | null): string | null {
    return this.api.publicUrl(logoUrl);
  }
}
