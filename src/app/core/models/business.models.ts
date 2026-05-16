export interface BusinessProfile {
  id: string;
  businessName: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
  taxNumber?: string | null;
  invoiceTemplate: InvoiceTemplate;
  invoiceAccentColor: string;
  invoicePaymentInstructions?: string | null;
  invoiceFooterNote?: string | null;
  planName: string;
  monthlyInvoiceLimit?: number | null;
}

export type InvoiceTemplate = 'classic' | 'modern' | 'compact';

export interface UpdateBusinessProfileRequest {
  businessName: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  currency: string;
  taxNumber?: string | null;
  invoiceTemplate: InvoiceTemplate;
  invoiceAccentColor: string;
  invoicePaymentInstructions?: string | null;
  invoiceFooterNote?: string | null;
}

export interface SubscriptionStatus {
  planName: string;
  planCode: string;
  monthlyInvoiceLimit?: number | null;
  invoicesCreatedThisMonth: number;
  canCreateInvoice: boolean;
}
