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
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { AdminBusiness } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-businesses-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatSortModule, MatTableModule],
  templateUrl: './businesses-list.component.html'
})
export class BusinessesListComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly search = new FormControl('', { nonNullable: true });
  displayedColumns = ['businessName', 'owner', 'phone', 'status', 'subscription', 'createdAt', 'actions'];
  items: AdminBusiness[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  sortBy = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.admin.businesses({ page: this.page, pageSize: this.pageSize, search: this.search.value, sortBy: this.sortBy, sortDirection: this.sortDirection })
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

  activate(business: AdminBusiness): void {
    this.admin.activateBusiness(business.businessId).subscribe(() => {
      this.notifications.success('Business activated.');
      this.load();
    });
  }

  suspend(business: AdminBusiness): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Suspend business', message: `Suspend ${business.businessName}?` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.admin.suspendBusiness(business.businessId).subscribe(() => {
        this.notifications.success('Business suspended.');
        this.load();
      });
    });
  }

  delete(business: AdminBusiness): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete business', message: `Delete ${business.businessName} and all related data?` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.admin.deleteBusiness(business.businessId).subscribe(() => {
        this.notifications.success('Business deleted.');
        this.load();
      });
    });
  }
}
