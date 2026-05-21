import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CustomerLedger } from '../../../core/models/customer.models';
import { CurrencyService } from '../../../core/services/currency.service';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-ledger',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatTableModule],
  templateUrl: './customer-ledger.component.html',
  styleUrl: './customer-ledger.component.scss'
})
export class CustomerLedgerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly customers = inject(CustomerService);
  private readonly currency = inject(CurrencyService);

  readonly currencyCode = this.currency.currencyCode;
  readonly invoiceColumns = ['invoiceNumber', 'issueDate', 'dueDate', 'paymentStatus', 'total', 'paidAmount', 'remainingAmount'];
  readonly paymentColumns = ['paymentDate', 'invoiceNumber', 'paymentMethod', 'amount', 'referenceNumber'];
  ledger?: CustomerLedger;
  customerId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.customers.ledger(this.customerId).subscribe((ledger) => (this.ledger = ledger));
  }

  print(): void {
    window.print();
  }
}
