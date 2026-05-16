import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.models';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSelectModule, MatTableModule],
  templateUrl: './invoices-list.component.html'
})
export class InvoicesListComponent implements OnInit {
  private readonly invoices = inject(InvoiceService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly search = new FormControl('', { nonNullable: true });
  readonly status = new FormControl<InvoiceStatus | ''>('', { nonNullable: true });
  displayedColumns = ['invoiceNumber', 'customerName', 'status', 'total', 'paidAmount', 'remainingAmount', 'dueDate', 'actions'];
  items: Invoice[] = [];
  total = 0;
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.invoices.list({ page: this.page, pageSize: this.pageSize, search: this.search.value, status: this.status.value, sortBy: 'createdAt', sortDirection: 'desc' })
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

  clearFilters(): void {
    this.search.setValue('');
    this.status.setValue('');
    this.page = 1;
    this.load();
  }

  download(invoice: Invoice): void {
    this.invoices.downloadPdf(invoice.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${invoice.invoiceNumber}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  share(invoice: Invoice): void {
    this.invoices.createShareLink(invoice.id).subscribe((share) => window.open(share.whatsAppUrl, '_blank', 'noopener'));
  }

  copyUrl(invoice: Invoice): void {
    this.invoices.createShareLink(invoice.id).subscribe((share) => {
      void navigator.clipboard?.writeText(share.publicInvoiceUrl);
      this.notifications.success('Invoice link copied to clipboard.');
    });
  }

  delete(invoice: Invoice): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete invoice', message: `Delete ${invoice.invoiceNumber}?` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.invoices.delete(invoice.id).subscribe(() => {
        this.notifications.success('Invoice deleted.');
        this.load();
      });
    });
  }
}
