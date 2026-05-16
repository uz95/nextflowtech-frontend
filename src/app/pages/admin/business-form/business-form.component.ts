import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminPlanCode, BusinessStatus, UpsertAdminBusinessRequest } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-business-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './business-form.component.html'
})
export class BusinessFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  id = this.route.snapshot.paramMap.get('id');
  readonly statuses: BusinessStatus[] = ['Active', 'Suspended'];
  readonly plans: Array<{ code: AdminPlanCode; label: string; description: string }> = [
    { code: 'FREE', label: 'Free', description: '10 invoices per month' },
    { code: 'PRO', label: 'Pro', description: 'Unlimited invoices' }
  ];
  readonly form = this.fb.nonNullable.group({
    businessName: ['', Validators.required],
    ownerName: ['', Validators.required],
    ownerEmail: ['', [Validators.required, Validators.email]],
    phone: [''],
    status: ['Active' as BusinessStatus, Validators.required],
    planCode: ['FREE' as AdminPlanCode, Validators.required]
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.admin.business(this.id).subscribe((business) => this.form.patchValue({
      businessName: business.businessName,
      ownerName: business.ownerName,
      ownerEmail: business.ownerEmail,
      phone: business.phone ?? '',
      status: business.status,
      planCode: this.toPlanCode(business.subscription?.planCode, business.subscription?.planName)
    }));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: UpsertAdminBusinessRequest = {
      businessName: raw.businessName,
      ownerName: raw.ownerName,
      ownerEmail: raw.ownerEmail,
      phone: raw.phone || null,
      status: raw.status,
      planCode: raw.planCode
    };
    const save$ = this.id ? this.admin.updateBusiness(this.id, request) : this.admin.createBusiness(request);
    save$.subscribe(() => {
      this.notifications.success(this.id ? 'Business updated.' : 'Business created.');
      void this.router.navigateByUrl('/admin/businesses');
    });
  }

  private toPlanCode(code?: string | null, name?: string | null): AdminPlanCode {
    const normalizedCode = code?.toUpperCase();
    const normalizedName = name?.toUpperCase();
    return normalizedCode === 'PREMIUM' || normalizedCode === 'PRO' || normalizedName === 'PREMIUM' || normalizedName === 'PRO'
      ? 'PRO'
      : 'FREE';
  }
}
