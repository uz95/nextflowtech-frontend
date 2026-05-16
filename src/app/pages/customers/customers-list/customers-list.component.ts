import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Customer } from '../../../core/models/customer.models';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSortModule, MatTableModule],
  templateUrl: './customers-list.component.html'
})
export class CustomersListComponent implements OnInit {
  private readonly customers = inject(CustomerService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly search = new FormControl('', { nonNullable: true });
  displayedColumns = ['fullName', 'email', 'phone', 'createdAt', 'actions'];
  items: Customer[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  sortBy = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.customers.list({ page: this.page, pageSize: this.pageSize, search: this.search.value, sortBy: this.sortBy, sortDirection: this.sortDirection })
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

  sortChanged(sort: Sort): void {
    this.sortBy = sort.active || 'createdAt';
    this.sortDirection = (sort.direction || 'asc') as 'asc' | 'desc';
    this.load();
  }

  resetSearch(): void {
    this.search.setValue('');
    this.page = 1;
    this.load();
  }

  delete(customer: Customer): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete customer', message: `Delete ${customer.fullName}?` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.customers.delete(customer.id).subscribe(() => {
        this.notifications.success('Customer deleted.');
        this.load();
      });
    });
  }
}