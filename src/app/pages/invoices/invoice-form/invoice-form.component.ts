import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Customer } from '../../../core/models/customer.models';
import { InventoryItem } from '../../../core/models/inventory.models';
import { Invoice, InvoiceStatus, UpsertInvoiceRequest } from '../../../core/models/invoice.models';
import { Payment, PaymentMethod, UpsertPaymentRequest } from '../../../core/models/payment.models';
import { CustomerService } from '../../../core/services/customer.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatTableModule],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss'
})
export class InvoiceFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customersService = inject(CustomerService);
  private readonly currency = inject(CurrencyService);
  private readonly inventoryService = inject(InventoryService);
  private readonly invoicesService = inject(InvoiceService);
  private readonly paymentsService = inject(PaymentService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  id = this.route.snapshot.paramMap.get('id');
  readonly currencyCode = this.currency.currencyCode;
  customers: Customer[] = [];
  inventoryItems: InventoryItem[] = [];
  currentInvoice?: Invoice;
  payments: Payment[] = [];
  shareLink: string | null = null;
  readonly paymentMethods: PaymentMethod[] = ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card', 'Other'];
  readonly paymentColumns = ['paymentDate', 'paymentMethod', 'amount', 'referenceNumber', 'actions'];
  readonly form = this.fb.group({
    customerId: ['', Validators.required],
    dueDate: [new Date(), Validators.required],
    status: ['Unpaid' as InvoiceStatus, Validators.required],
    discountAmount: [0, [Validators.min(0)]],
    notes: [''],
    items: this.fb.array([this.createItem()])
  });
  readonly paymentForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paymentDate: [new Date(), Validators.required],
    paymentMethod: ['Cash' as PaymentMethod, Validators.required],
    referenceNumber: [''],
    notes: ['']
  });

  get items(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.customersService.list({ page: 1, pageSize: 100, sortBy: 'lastName' }).subscribe((result) => (this.customers = result.items));
    this.inventoryService.list({ page: 1, pageSize: 100, sortBy: 'name', isActive: true }).subscribe((result) => (this.inventoryItems = result.items));

    if (!this.id) return;
    this.loadInvoice();
    this.loadPayments();
  }

  loadInvoice(): void {
    if (!this.id) return;
    this.invoicesService.get(this.id).subscribe((invoice) => {
      this.currentInvoice = invoice;
      this.form.patchValue({
        customerId: invoice.customerId,
        dueDate: new Date(invoice.dueDate),
        status: invoice.status,
        discountAmount: invoice.discountAmount,
        notes: invoice.notes ?? ''
      });
      this.items.clear();
      invoice.items.forEach((item) => this.items.push(this.createItem(item)));
    });
  }

  loadPayments(): void {
    if (!this.id) return;
    this.invoicesService.payments(this.id).subscribe((payments) => (this.payments = payments));
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  inventoryItemChanged(index: number, inventoryItemId: string | null): void {
    if (!inventoryItemId) {
      return;
    }

    const item = this.inventoryItems.find((candidate) => candidate.id === inventoryItemId);
    const group = this.items.at(index);
    if (!item || !group) {
      return;
    }

    group.patchValue({
      description: item.name,
      unitPrice: item.unitPrice
    });
  }

  subtotal(): number {
    return this.items.controls.reduce((sum, group) => sum + this.lineSubtotal(group), 0);
  }

  taxTotal(): number {
    return this.items.controls.reduce((sum, group) => sum + this.lineTax(group), 0);
  }

  total(): number {
    return Math.max(0, this.subtotal() + this.taxTotal() - Number(this.form.value.discountAmount ?? 0));
  }

  submitPayment(): void {
    if (!this.id || this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.invoicesService.addPayment(this.id, this.toPaymentRequest()).subscribe(() => {
      this.notifications.success('Payment recorded.');
      this.paymentForm.reset({ amount: 0, paymentDate: new Date(), paymentMethod: 'Cash', referenceNumber: '', notes: '' });
      this.loadInvoice();
      this.loadPayments();
    });
  }

  deletePayment(payment: Payment): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete payment', message: `Delete ${payment.amount} payment?` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.paymentsService.delete(payment.id).subscribe(() => {
        this.notifications.success('Payment deleted.');
        this.loadInvoice();
        this.loadPayments();
      });
    });
  }

  copyPublicLink(): void {
    if (!this.id) return;
    this.invoicesService.createShareLink(this.id).subscribe((share) => {
      this.shareLink = share.publicInvoiceUrl;
      void navigator.clipboard?.writeText(share.publicInvoiceUrl);
      this.notifications.success('Public invoice link copied.');
    });
  }

  shareOnWhatsApp(): void {
    if (!this.id) return;
    this.invoicesService.createShareLink(this.id).subscribe((share) => {
      this.shareLink = share.publicInvoiceUrl;
      window.open(share.whatsAppUrl, '_blank', 'noopener');
    });
  }

  sendReminder(): void {
    if (!this.id) return;
    this.invoicesService.sendWhatsAppReminder(this.id).subscribe((share) => {
      this.shareLink = share.publicInvoiceUrl;
      window.open(share.whatsAppUrl, '_blank', 'noopener');
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: UpsertInvoiceRequest = {
      customerId: value.customerId ?? '',
      dueDate: (value.dueDate instanceof Date ? value.dueDate : new Date(value.dueDate ?? new Date())).toISOString(),
      status: value.status ?? 'Unpaid',
      discountAmount: Number(value.discountAmount ?? 0),
      notes: value.notes,
      items: value.items.map((item) => ({
        inventoryItemId: item['inventoryItemId'] || null,
        description: item['description'] ?? '',
        quantity: Number(item['quantity'] ?? 0),
        unitPrice: Number(item['unitPrice'] ?? 0),
        taxPercent: Number(item['taxPercent'] ?? 0)
      }))
    };

    const save$ = this.id ? this.invoicesService.update(this.id, request) : this.invoicesService.create(request);
    save$.subscribe(() => {
      this.notifications.success(this.id ? 'Invoice updated.' : 'Invoice created.');
      void this.router.navigateByUrl('/invoices');
    });
  }

  private createItem(item?: { inventoryItemId?: string | null; description: string; quantity: number; unitPrice: number; taxPercent: number }): FormGroup {
    return this.fb.nonNullable.group({
      inventoryItemId: [item?.inventoryItemId ?? ''],
      description: [item?.description ?? '', Validators.required],
      quantity: [item?.quantity ?? 1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [item?.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
      taxPercent: [item?.taxPercent ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  private lineSubtotal(group: FormGroup): number {
    return Number(group.get('quantity')?.value ?? 0) * Number(group.get('unitPrice')?.value ?? 0);
  }

  private lineTax(group: FormGroup): number {
    return this.lineSubtotal(group) * (Number(group.get('taxPercent')?.value ?? 0) / 100);
  }

  private toPaymentRequest(): UpsertPaymentRequest {
    const value = this.paymentForm.getRawValue();
    return {
      invoiceId: this.id ?? '',
      amount: Number(value.amount ?? 0),
      paymentDate: (value.paymentDate instanceof Date ? value.paymentDate : new Date(value.paymentDate ?? new Date())).toISOString(),
      paymentMethod: value.paymentMethod ?? 'Cash',
      referenceNumber: value.referenceNumber,
      notes: value.notes
    };
  }
}
