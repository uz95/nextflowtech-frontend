import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/api.models';
import { Expense, ExpenseQueryParams, UpsertExpenseRequest } from '../models/expense.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly api = inject(ApiService);

  list(params: ExpenseQueryParams): Observable<PagedResult<Expense>> {
    return this.api.get<PagedResult<Expense>>('expenses', params);
  }

  create(request: UpsertExpenseRequest): Observable<Expense> {
    return this.api.post<Expense>('expenses', request);
  }

  update(id: string, request: UpsertExpenseRequest): Observable<Expense> {
    return this.api.put<Expense>(`expenses/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`expenses/${id}`);
  }
}