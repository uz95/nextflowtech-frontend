import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/api.models';
import { Invoice, InvoiceQueryParams, InvoiceShareLink, PublicInvoice, UpsertInvoiceRequest, WhatsAppInvoiceShare } from '../models/invoice.models';
import { Payment, UpsertPaymentRequest } from '../models/payment.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly api = inject(ApiService);

  list(params: InvoiceQueryParams): Observable<PagedResult<Invoice>> {
    return this.api.get<PagedResult<Invoice>>('invoices', params);
  }

  get(id: string): Observable<Invoice> {
    return this.api.get<Invoice>(`invoices/${id}`);
  }

  create(request: UpsertInvoiceRequest): Observable<Invoice> {
    return this.api.post<Invoice>('invoices', request);
  }

  update(id: string, request: UpsertInvoiceRequest): Observable<Invoice> {
    return this.api.put<Invoice>(`invoices/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`invoices/${id}`);
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.api.download(`invoices/${id}/pdf`);
  }

  payments(id: string): Observable<Payment[]> {
    return this.api.get<Payment[]>(`invoices/${id}/payments`);
  }

  addPayment(id: string, request: UpsertPaymentRequest): Observable<Payment> {
    return this.api.post<Payment>(`invoices/${id}/payments`, request);
  }

  createShareLink(id: string): Observable<InvoiceShareLink> {
    return this.api.post<InvoiceShareLink>(`invoices/${id}/share-link`, {});
  }

  sendWhatsAppReminder(id: string): Observable<WhatsAppInvoiceShare> {
    return this.api.post<WhatsAppInvoiceShare>(`invoices/${id}/send-whatsapp-reminder`, {});
  }

  getPublicInvoice(token: string): Observable<PublicInvoice> {
    return this.api.get<PublicInvoice>(`public/invoices/${token}`);
  }
}
