export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface UpsertCustomerRequest {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface CustomerLedgerInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
}

export interface CustomerLedgerPayment {
  id: string;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
}

export interface CustomerLedgerTimelineItem {
  type: 'Invoice' | 'Payment';
  date: string;
  title: string;
  amount: number;
  invoiceId?: string | null;
  paymentId?: string | null;
}

export interface CustomerLedger {
  customer: Customer;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  totalRemainingBalance: number;
  numberOfUnpaidInvoices: number;
  numberOfOverdueInvoices: number;
  invoices: CustomerLedgerInvoice[];
  payments: CustomerLedgerPayment[];
  timeline: CustomerLedgerTimelineItem[];
}

export interface CustomerStatement {
  business: {
    businessName: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    currency: string;
    taxNumber?: string | null;
  };
  customer: Customer;
  from: string;
  to: string;
  invoices: CustomerLedgerInvoice[];
  payments: CustomerLedgerPayment[];
  openingBalance: number;
  invoiceTotal: number;
  paymentTotal: number;
  closingBalance: number;
}
