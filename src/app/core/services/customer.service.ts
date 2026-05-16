import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult, QueryParams } from '../models/api.models';
import { Customer, CustomerLedger, CustomerStatement, UpsertCustomerRequest } from '../models/customer.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = inject(ApiService);

  list(params: QueryParams): Observable<PagedResult<Customer>> {
    return this.api.get<PagedResult<Customer>>('customers', params);
  }

  get(id: string): Observable<Customer> {
    return this.api.get<Customer>(`customers/${id}`);
  }

  create(request: UpsertCustomerRequest): Observable<Customer> {
    return this.api.post<Customer>('customers', request);
  }

  update(id: string, request: UpsertCustomerRequest): Observable<Customer> {
    return this.api.put<Customer>(`customers/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`customers/${id}`);
  }

  ledger(id: string): Observable<CustomerLedger> {
    return this.api.get<CustomerLedger>(`customers/${id}/ledger`);
  }

  statement(id: string, from?: string, to?: string): Observable<CustomerStatement> {
    return this.api.get<CustomerStatement>(`customers/${id}/statement`, { from, to });
  }
}
