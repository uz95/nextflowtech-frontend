import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { BusinessProfile, InvoiceTemplate, SubscriptionStatus, UpdateBusinessProfileRequest } from '../../core/models/business.models';
import { BusinessService } from '../../core/services/business.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly business = inject(BusinessService);
  private readonly notifications = inject(NotificationService);

  profile?: BusinessProfile;
  subscription?: SubscriptionStatus;
  logoPreviewUrl: string | null = null;
  logoUploading = false;
  readonly invoiceTemplates: { value: InvoiceTemplate; label: string; description: string }[] = [
    { value: 'classic', label: 'Classic', description: 'Clean business layout for most invoices.' },
    { value: 'modern', label: 'Modern', description: 'Accent-led header with stronger section contrast.' },
    { value: 'compact', label: 'Compact', description: 'Tighter spacing for longer item lists.' }
  ];

  readonly form = this.fb.nonNullable.group({
    businessName: ['', Validators.required],
    logoUrl: [''],
    address: [''],
    phone: [''],
    email: ['', Validators.email],
    currency: ['USD', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    taxNumber: [''],
    invoiceTemplate: ['classic' as InvoiceTemplate, Validators.required],
    invoiceAccentColor: ['#08746F', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
    invoicePaymentInstructions: [''],
    invoiceFooterNote: ['']
  });

  ngOnInit(): void {
    this.business.getProfile().subscribe((profile) => {
      this.applyProfile(profile);
    });
    this.business.subscriptionStatus().subscribe((status) => (this.subscription = status));
  }

  uploadLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      this.notifications.error('Logo must be a PNG or JPG image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.notifications.error('Logo must be 2 MB or smaller.');
      return;
    }

    this.logoUploading = true;
    this.business.uploadLogo(file).pipe(finalize(() => (this.logoUploading = false))).subscribe((profile) => {
      this.applyProfile(profile);
      this.notifications.success('Business logo uploaded.');
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request: UpdateBusinessProfileRequest = {
      ...value,
      invoiceTemplate: value.invoiceTemplate as InvoiceTemplate
    };

    this.business.updateProfile(request).subscribe((profile) => {
      this.applyProfile(profile);
      this.notifications.success('Business settings updated.');
    });
  }

  private applyProfile(profile: BusinessProfile): void {
    this.profile = profile;
    this.logoPreviewUrl = this.business.publicLogoUrl(profile.logoUrl);
    this.form.patchValue({
      businessName: profile.businessName,
      logoUrl: profile.logoUrl ?? '',
      address: profile.address ?? '',
      phone: profile.phone ?? '',
      email: profile.email ?? '',
      currency: profile.currency,
      taxNumber: profile.taxNumber ?? '',
      invoiceTemplate: profile.invoiceTemplate ?? 'classic',
      invoiceAccentColor: profile.invoiceAccentColor ?? '#08746F',
      invoicePaymentInstructions: profile.invoicePaymentInstructions ?? '',
      invoiceFooterNote: profile.invoiceFooterNote ?? ''
    });
  }
}
