import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AdminWhatsAppAccount } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-whatsapp-accounts',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatIconModule, MatTableModule],
  templateUrl: './whatsapp-accounts.component.html'
})
export class WhatsAppAccountsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  displayedColumns = ['business', 'displayName', 'phone', 'phoneNumberId', 'waba', 'status', 'updatedAt'];
  accounts: AdminWhatsAppAccount[] = [];

  ngOnInit(): void {
    this.admin.whatsAppAccounts().subscribe((accounts) => (this.accounts = accounts));
  }
}
