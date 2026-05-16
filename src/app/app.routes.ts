import { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { AccountSecurityComponent } from './pages/account-security/account-security.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { BusinessFormComponent } from './pages/admin/business-form/business-form.component';
import { BusinessSubscriptionComponent } from './pages/admin/business-subscription/business-subscription.component';
import { BusinessesListComponent } from './pages/admin/businesses-list/businesses-list.component';
import { ExternalAuthCallbackComponent } from './pages/auth/external-auth-callback.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { CustomerFormComponent } from './pages/customers/customer-form/customer-form.component';
import { CustomerLedgerComponent } from './pages/customers/customer-ledger/customer-ledger.component';
import { CustomersListComponent } from './pages/customers/customers-list/customers-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { InvoiceFormComponent } from './pages/invoices/invoice-form/invoice-form.component';
import { InvoicesListComponent } from './pages/invoices/invoices-list/invoices-list.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { PublicInvoiceComponent } from './pages/public-invoice/public-invoice.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'auth/external-callback', component: ExternalAuthCallbackComponent },
  { path: 'public/invoices/:token', component: PublicInvoiceComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'customers', component: CustomersListComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'customers/new', component: CustomerFormComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'customers/:id/edit', component: CustomerFormComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'customers/:id/ledger', component: CustomerLedgerComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'invoices', component: InvoicesListComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'invoices/new', component: InvoiceFormComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'invoices/:id/edit', component: InvoiceFormComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'payments', component: PaymentsComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'notifications', component: NotificationsComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'inventory', component: InventoryComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'expenses', component: ExpensesComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'settings', component: SettingsComponent, data: { roles: ['BusinessOwner'] } },
      { path: 'account/security', component: AccountSecurityComponent, data: { roles: ['BusinessOwner', 'SuperAdmin'] } },
      { path: 'admin/dashboard', component: AdminDashboardComponent, data: { roles: ['SuperAdmin'] } },
      { path: 'admin/businesses', component: BusinessesListComponent, data: { roles: ['SuperAdmin'] } },
      { path: 'admin/businesses/new', component: BusinessFormComponent, data: { roles: ['SuperAdmin'] } },
      { path: 'admin/businesses/:id/edit', component: BusinessFormComponent, data: { roles: ['SuperAdmin'] } },
      { path: 'admin/businesses/:id/subscription', component: BusinessSubscriptionComponent, data: { roles: ['SuperAdmin'] } }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
