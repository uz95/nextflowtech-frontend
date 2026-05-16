import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { PublicInvoice } from '../../core/models/invoice.models';
import { InvoiceService } from '../../core/services/invoice.service';

@Component({
  selector: 'app-public-invoice',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, MatCardModule, MatTableModule],
  templateUrl: './public-invoice.component.html',
  styleUrl: './public-invoice.component.scss'
})
export class PublicInvoiceComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly invoices = inject(InvoiceService);
  readonly columns = ['description', 'quantity', 'unitPrice', 'taxPercent', 'total'];
  invoice?: PublicInvoice;

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.invoices.getPublicInvoice(token).subscribe((invoice) => (this.invoice = invoice));
  }
}
