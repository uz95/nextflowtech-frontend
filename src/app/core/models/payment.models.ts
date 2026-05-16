import { QueryParams } from './api.models';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa' | 'Card' | 'Other';

export interface Payment {
  id: string;
  invoiceId?: string | null;
  customerId: string;
  invoiceNumber?: string | null;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface UpsertPaymentRequest {
  invoiceId?: string | null;
  customerId?: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface PaymentQueryParams extends QueryParams {
  invoiceId?: string;
  customerId?: string;
  paymentMethod?: PaymentMethod | '';
  from?: string;
  to?: string;
}
