import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult, QueryParams } from '../models/api.models';
import { AdminBusiness, SuperAdminDashboard, UpdateBusinessSubscriptionRequest, UpsertAdminBusinessRequest } from '../models/admin.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  dashboard(): Observable<SuperAdminDashboard> {
    return this.api.get<SuperAdminDashboard>('admin/dashboard');
  }

  businesses(params?: QueryParams): Observable<PagedResult<AdminBusiness>> {
    return this.api.get<PagedResult<AdminBusiness>>('admin/businesses', params);
  }

  business(id: string): Observable<AdminBusiness> {
    return this.api.get<AdminBusiness>(`admin/businesses/${id}`);
  }

  createBusiness(request: UpsertAdminBusinessRequest): Observable<AdminBusiness> {
    return this.api.post<AdminBusiness>('admin/businesses', request);
  }

  updateBusiness(id: string, request: UpsertAdminBusinessRequest): Observable<AdminBusiness> {
    return this.api.put<AdminBusiness>(`admin/businesses/${id}`, request);
  }

  deleteBusiness(id: string): Observable<void> {
    return this.api.delete<void>(`admin/businesses/${id}`);
  }

  activateBusiness(id: string): Observable<AdminBusiness> {
    return this.api.post<AdminBusiness>(`admin/businesses/${id}/activate`, {});
  }

  suspendBusiness(id: string): Observable<AdminBusiness> {
    return this.api.post<AdminBusiness>(`admin/businesses/${id}/suspend`, {});
  }

  updateSubscription(id: string, request: UpdateBusinessSubscriptionRequest): Observable<AdminBusiness> {
    return this.api.put<AdminBusiness>(`admin/businesses/${id}/subscription`, request);
  }
}
