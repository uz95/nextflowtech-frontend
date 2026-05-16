import { Customer } from './customer.models';
import { Invoice } from './invoice.models';
import { Payment } from './payment.models';

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
}

export interface Dashboard {
  totalRevenue: number;
  unpaidInvoices: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalReceivable: number;
  totalCollectedThisMonth: number;
  overdueAmount: number;
  overdueInvoicesCount: number;
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  recentCustomers: Customer[];
  topUnpaidCustomers: TopUnpaidCustomer[];
  monthlyRevenue: MonthlyRevenuePoint[];
}

export interface TopUnpaidCustomer {
  customerId: string;
  customerName: string;
  balance: number;
  unpaidInvoicesCount: number;
  overdueInvoicesCount: number;
}
