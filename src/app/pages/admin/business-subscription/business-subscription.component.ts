import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminBusiness, AdminSubscriptionStatus, UpdateBusinessSubscriptionRequest } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-business-subscription',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './business-subscription.component.html'
})
export class BusinessSubscriptionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  id = this.route.snapshot.paramMap.get('id') ?? '';
  business?: AdminBusiness;
  readonly statuses: AdminSubscriptionStatus[] = ['Active', 'Expired', 'Trial', 'Suspended'];
  readonly form = this.fb.nonNullable.group({
    planName: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    startDate: [this.toDateInput(new Date().toISOString()), Validators.required],
    endDate: [''],
    status: ['Active' as AdminSubscriptionStatus, Validators.required]
  });

  ngOnInit(): void {
    this.admin.business(this.id).subscribe((business) => {
      this.business = business;
      this.form.patchValue({
        planName: business.subscription?.planName ?? '',
        price: business.subscription?.price ?? 0,
        startDate: this.toDateInput(business.subscription?.startDate ?? new Date().toISOString()),
        endDate: business.subscription?.endDate ? this.toDateInput(business.subscription.endDate) : '',
        status: business.subscription?.status ?? 'Active'
      });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: UpdateBusinessSubscriptionRequest = {
      planName: raw.planName,
      price: raw.price,
      startDate: raw.startDate,
      endDate: raw.endDate || null,
      status: raw.status
    };

    this.admin.updateSubscription(this.id, request).subscribe(() => {
      this.notifications.success('Subscription updated.');
      void this.router.navigateByUrl('/admin/businesses');
    });
  }

  private toDateInput(value: string): string {
    return value.split('T')[0];
  }
}
