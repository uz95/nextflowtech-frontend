import { QueryParams } from './api.models';
import { InvoiceTemplate } from './business.models';

export type InvoiceStatus = 'Pending' | 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';

export interface InvoiceItem {
  id: string;
  inventoryItemId?: string | null;
  inventoryItemName?: string | null;
  inventoryItemSku?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: InvoiceStatus;
  lastPaymentDate?: string | null;
  notes?: string | null;
  items: InvoiceItem[];
}

export interface UpsertInvoiceItemRequest {
  inventoryItemId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
}

export interface UpsertInvoiceRequest {
  customerId: string;
  dueDate: string;
  status: InvoiceStatus;
  discountAmount: number;
  notes?: string | null;
  items: UpsertInvoiceItemRequest[];
}

export interface InvoiceQueryParams extends QueryParams {
  status?: InvoiceStatus | '';
  customerId?: string;
  from?: string;
  to?: string;
}

export interface InvoiceShareLink {
  publicInvoiceUrl: string;
  whatsAppUrl: string;
  message: string;
  expiresAt: string;
}

export interface WhatsAppInvoiceShare {
  publicInvoiceUrl: string;
  whatsAppUrl: string;
  message: string;
  cloudApiSent: boolean;
  providerMessage?: string | null;
}

export interface PublicInvoice {
  businessName: string;
  businessAddress?: string | null;
  businessEmail?: string | null;
  businessPhone?: string | null;
  businessTaxNumber?: string | null;
  currency: string;
  invoiceTemplate: InvoiceTemplate;
  invoiceAccentColor: string;
  invoicePaymentInstructions?: string | null;
  invoiceFooterNote?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentStatus: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string | null;
  items: PublicInvoiceItem[];
}

export interface PublicInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
}
