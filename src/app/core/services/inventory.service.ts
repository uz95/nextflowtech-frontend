import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/api.models';
import { AdjustInventoryRequest, InventoryItem, InventoryQueryParams, UpsertInventoryItemRequest } from '../models/inventory.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = inject(ApiService);

  list(params: InventoryQueryParams): Observable<PagedResult<InventoryItem>> {
    return this.api.get<PagedResult<InventoryItem>>('inventory', params);
  }

  get(id: string): Observable<InventoryItem> {
    return this.api.get<InventoryItem>(`inventory/${id}`);
  }

  create(request: UpsertInventoryItemRequest): Observable<InventoryItem> {
    return this.api.post<InventoryItem>('inventory', request);
  }

  update(id: string, request: UpsertInventoryItemRequest): Observable<InventoryItem> {
    return this.api.put<InventoryItem>(`inventory/${id}`, request);
  }

  adjust(id: string, request: AdjustInventoryRequest): Observable<{ id: string; quantityOnHand: number }> {
    return this.api.post<{ id: string; quantityOnHand: number }>(`inventory/${id}/adjust`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`inventory/${id}`);
  }
}
