import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Dashboard, MonthlyRevenuePoint } from '../../core/models/dashboard.models';
import { CurrencyService } from '../../core/services/currency.service';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, MatCardModule, MatIconModule, MatTableModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly currency = inject(CurrencyService);
  readonly currencyCode = this.currency.currencyCode;
  dashboard: Dashboard = this.emptyDashboard();
  isLoading = true;
  loadError = '';
  invoiceColumns = ['invoiceNumber', 'customerName', 'status', 'total', 'dueDate'];
  paymentColumns = ['paymentDate', 'invoiceNumber', 'customerName', 'amount'];
  customerColumns = ['fullName', 'email', 'phone'];
  unpaidCustomerColumns = ['customerName', 'balance', 'unpaidInvoicesCount', 'overdueInvoicesCount'];

  ngOnInit(): void {
    this.dashboardService.get().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.isLoading = false;
        this.loadError = '';
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.loadError = this.dashboardErrorMessage(error);
      }
    });
  }

  chartPoints(points: MonthlyRevenuePoint[]): string {
    if (points.length === 0) {
      return '';
    }
    const width = 640;
    const height = 180;
    const max = Math.max(...points.map((x) => x.revenue), 1);
    return points
      .map((point, index) => {
        const x = points.length === 1 ? width / 2 : index * (width / (points.length - 1));
        const y = height - (point.revenue / max) * (height - 20) - 10;
        return `${x},${y}`;
      })
      .join(' ');
  }

  private emptyDashboard(): Dashboard {
    return {
      totalRevenue: 0,
      unpaidInvoices: 0,
      totalExpenses: 0,
      estimatedProfit: 0,
      totalReceivable: 0,
      totalCollectedThisMonth: 0,
      overdueAmount: 0,
      overdueInvoicesCount: 0,
      recentInvoices: [],
      recentPayments: [],
      recentCustomers: [],
      topUnpaidCustomers: [],
      monthlyRevenue: [
        { month: 'Jan', revenue: 0 },
        { month: 'Feb', revenue: 0 },
        { month: 'Mar', revenue: 0 },
        { month: 'Apr', revenue: 0 },
        { month: 'May', revenue: 0 },
        { month: 'Jun', revenue: 0 }
      ]
    };
  }

  private dashboardErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'The browser cannot reach the API at https://localhost:5001. Confirm the API window is running and refresh the page.';
      }

      if (error.status === 401) {
        return 'Your session expired. Sign in again to load live dashboard data.';
      }

      if (error.status === 403) {
        return 'This account does not have permission to view the owner dashboard.';
      }

      return error.error?.title || error.error?.message || error.message || 'Dashboard data could not be loaded.';
    }

    return 'Dashboard data could not be loaded.';
  }
}
