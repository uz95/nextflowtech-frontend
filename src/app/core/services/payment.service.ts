import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/api.models';
import { Payment, PaymentQueryParams, UpsertPaymentRequest } from '../models/payment.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = inject(ApiService);

  list(params: PaymentQueryParams): Observable<PagedResult<Payment>> {
    return this.api.get<PagedResult<Payment>>('payments', params);
  }

  get(id: string): Observable<Payment> {
    return this.api.get<Payment>(`payments/${id}`);
  }

  create(request: UpsertPaymentRequest): Observable<Payment> {
    return this.api.post<Payment>('payments', request);
  }

  update(id: string, request: UpsertPaymentRequest): Observable<Payment> {
    return this.api.put<Payment>(`payments/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`payments/${id}`);
  }
}
