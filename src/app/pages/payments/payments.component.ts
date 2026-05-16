import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { Customer } from '../../core/models/customer.models';
import { Invoice } from '../../core/models/invoice.models';
import { Payment, PaymentMethod, UpsertPaymentRequest } from '../../core/models/payment.models';
import { CustomerService } from '../../core/services/customer.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { NotificationService } from '../../core/services/notification.service';
import { PaymentService } from '../../core/services/payment.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatTableModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly paymentsService = inject(PaymentService);
  private readonly invoicesService = inject(InvoiceService);
  private readonly customersService = inject(CustomerService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly search = new FormControl('', { nonNullable: true });
  readonly paymentMethods: PaymentMethod[] = ['Cash', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Card', 'Other'];
  readonly displayedColumns = ['paymentDate', 'invoiceNumber', 'customerName', 'paymentMethod', 'amount', 'referenceNumber', 'actions'];
  readonly form = this.fb.group({
    invoiceId: [''],
    customerId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paymentDate: [new Date(), Validators.required],
    paymentMethod: ['Cash' as PaymentMethod, Validators.required],
    referenceNumber: [''],
    notes: ['']
  });

  customers: Customer[] = [];
  invoices: Invoice[] = [];
  items: Payment[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  editingId: string | null = null;

  ngOnInit(): void {
    this.invoicesService.list({ page: 1, pageSize: 100, sortBy: 'createdAt', sortDirection: 'desc' }).subscribe((result) => (this.invoices = result.items));
    this.customersService.list({ page: 1, pageSize: 100, sortBy: 'lastName', sortDirection: 'asc' }).subscribe((result) => (this.customers = result.items));
    this.form.controls.invoiceId.valueChanges.subscribe((invoiceId) => this.syncCustomerFromInvoice(invoiceId));
    this.load();
  }

  load(): void {
    this.paymentsService.list({ page: this.page, pageSize: this.pageSize, search: this.search.value, sortBy: 'paymentDate', sortDirection: 'desc' })
      .subscribe((result) => {
        this.items = result.items;
        this.total = result.totalCount;
      });
  }

  pageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.toRequest();
    const save$ = this.editingId ? this.paymentsService.update(this.editingId, request) : this.paymentsService.create(request);
    save$.subscribe(() => {
      this.notifications.success(this.editingId ? 'Payment updated.' : 'Payment recorded.');
      this.resetForm();
      this.load();
    });
  }

  edit(payment: Payment): void {
    this.editingId = payment.id;
    this.form.patchValue({
      invoiceId: payment.invoiceId ?? '',
      customerId: payment.customerId,
      amount: payment.amount,
      paymentDate: new Date(payment.paymentDate),
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber ?? '',
      notes: payment.notes ?? ''
    });
  }

  delete(payment: Payment): void {
    const paymentLabel = payment.invoiceNumber ? `invoice ${payment.invoiceNumber}` : payment.customerName;
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete payment', message: `Delete payment for ${paymentLabel}?` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.paymentsService.delete(payment.id).subscribe(() => {
        this.notifications.success('Payment deleted.');
        this.load();
      });
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      invoiceId: '',
      customerId: '',
      amount: 0,
      paymentDate: new Date(),
      paymentMethod: 'Cash',
      referenceNumber: '',
      notes: ''
    });
  }

  private toRequest(): UpsertPaymentRequest {
    const value = this.form.getRawValue();
    return {
      invoiceId: value.invoiceId || null,
      customerId: value.customerId || null,
      amount: Number(value.amount ?? 0),
      paymentDate: (value.paymentDate instanceof Date ? value.paymentDate : new Date(value.paymentDate ?? new Date())).toISOString(),
      paymentMethod: value.paymentMethod ?? 'Cash',
      referenceNumber: value.referenceNumber,
      notes: value.notes
    };
  }

  private syncCustomerFromInvoice(invoiceId: string | null): void {
    if (!invoiceId) return;

    const invoice = this.invoices.find((item) => item.id === invoiceId);
    if (invoice && this.form.controls.customerId.value !== invoice.customerId) {
      this.form.controls.customerId.setValue(invoice.customerId);
    }
  }
}
