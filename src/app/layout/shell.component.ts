import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { asyncScheduler, observeOn } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BusinessProfile } from '../core/models/business.models';
import { AppNotificationService } from '../core/services/app-notification.service';
import { AuthService } from '../core/services/auth.service';
import { BusinessService } from '../core/services/business.service';
import { WhatsAppRealtimeService } from '../core/services/whatsapp-realtime.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatButtonModule, MatBadgeModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly business = inject(BusinessService);
  private readonly appNotifications = inject(AppNotificationService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly whatsAppRealtime = inject(WhatsAppRealtimeService);

  profile: BusinessProfile | null = null;
  logoUrl: string | null = null;
  unreadCount = 0;
  isMobile = false;
  mobileNavExpanded = false;
  brandTitle = this.auth.hasRole('SuperAdmin') ? 'Super Admin' : 'NextFlowTech';
  brandSubtitle = this.auth.hasRole('SuperAdmin') ? 'Admin workspace' : 'Owner workspace';

  readonly ownerNavItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'Customers', icon: 'groups', path: '/customers' },
    { label: 'Invoices', icon: 'receipt_long', path: '/invoices' },
    { label: 'Inbox', icon: 'forum', path: '/inbox' },
    { label: 'Payments', icon: 'payments', path: '/payments' },
    { label: 'Inventory', icon: 'inventory_2', path: '/inventory' },
    { label: 'Expenses', icon: 'request_quote', path: '/expenses' },
    { label: 'Notifications', icon: 'notifications', path: '/notifications' },
    { label: 'Settings', icon: 'settings', path: '/settings' },
    { label: 'Security', icon: 'lock', path: '/account/security' }
  ];

  readonly adminNavItems = [
    { label: 'Admin Dashboard', icon: 'admin_panel_settings', path: '/admin/dashboard' },
    { label: 'Businesses', icon: 'business', path: '/admin/businesses' },
    { label: 'WhatsApp Accounts', icon: 'forum', path: '/admin/whatsapp-accounts' },
    { label: 'Security', icon: 'lock', path: '/account/security' }
  ];

  get navItems(): { label: string; icon: string; path: string }[] {
    return this.isSuperAdmin ? this.adminNavItems : this.ownerNavItems;
  }

  get isSuperAdmin(): boolean {
    return this.auth.hasRole('SuperAdmin');
  }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 900px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.isMobile = state.matches;
        this.mobileNavExpanded = false;
      });

    if (this.isSuperAdmin) {
      return;
    }

    this.whatsAppRealtime.start();
    this.business.profile$
      .pipe(observeOn(asyncScheduler), takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        this.profile = profile;
        this.logoUrl = this.business.publicLogoUrl(profile?.logoUrl);
        this.brandTitle = profile?.businessName || 'NextFlowTech';
      });
    this.appNotifications.unreadCount$
      .pipe(observeOn(asyncScheduler), takeUntilDestroyed(this.destroyRef))
      .subscribe((count) => (this.unreadCount = count));
    this.business.getProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.appNotifications.loadUnreadCount();
  }

  openNotifications(): void {
    void this.router.navigateByUrl('/notifications');
  }

  toggleMobileNav(): void {
    if (this.isMobile) {
      this.mobileNavExpanded = !this.mobileNavExpanded;
    }
  }

  collapseMenuOnMobile(): void {
    if (this.isMobile) {
      this.mobileNavExpanded = false;
    }
  }

  logout(): void {
    this.whatsAppRealtime.stop();
    this.auth.logout(false);
    void this.router.navigateByUrl('/login');
  }
}
