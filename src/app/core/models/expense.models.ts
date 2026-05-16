import { QueryParams } from './api.models';

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
  createdAt: string;
}

export interface UpsertExpenseRequest {
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes?: string | null;
}

export interface ExpenseQueryParams extends QueryParams {
  category?: string;
  from?: string;
  to?: string;
}