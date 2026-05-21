import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WhatsAppAccount } from '../../../core/models/whatsapp.models';
import { NotificationService } from '../../../core/services/notification.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-integration',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSlideToggleModule],
  templateUrl: './whatsapp-integration.component.html',
  styleUrl: './whatsapp-integration.component.scss'
})
export class WhatsAppIntegrationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly whatsApp = inject(WhatsAppService);

  account?: WhatsAppAccount | null;
  loading = false;
  saving = false;
  readonly webhookUrl = `${environment.apiUrl.replace(/\/$/, '')}/whatsapp/webhook`;

  readonly form = this.fb.nonNullable.group({
    displayName: ['WhatsApp Business', [Validators.maxLength(150)]],
    phoneNumber: ['', [Validators.maxLength(50)]],
    phoneNumberId: ['', [Validators.required, Validators.maxLength(100)]],
    whatsAppBusinessAccountId: ['', [Validators.required, Validators.maxLength(100)]],
    accessToken: ['', [Validators.maxLength(4000)]],
    webhookVerifyToken: ['', [Validators.maxLength(1000)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.whatsApp.getAccount().pipe(finalize(() => (this.loading = false))).subscribe((account) => {
      this.account = account;
      if (account) {
        this.form.patchValue({
          displayName: account.displayName,
          phoneNumber: account.phoneNumber ?? '',
          phoneNumberId: account.phoneNumberId,
          whatsAppBusinessAccountId: account.whatsAppBusinessAccountId,
          accessToken: '',
          webhookVerifyToken: '',
          isActive: account.isActive
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const value = this.form.getRawValue();
    this.whatsApp.upsertAccount({
      displayName: value.displayName,
      phoneNumber: value.phoneNumber,
      phoneNumberId: value.phoneNumberId,
      whatsAppBusinessAccountId: value.whatsAppBusinessAccountId,
      accessToken: value.accessToken || null,
      webhookVerifyToken: value.webhookVerifyToken || null,
      isActive: value.isActive
    }).pipe(finalize(() => (this.saving = false))).subscribe((account) => {
      this.account = account;
      this.form.patchValue({ accessToken: '', webhookVerifyToken: '' });
      this.notifications.success('WhatsApp integration saved.');
    });
  }
}
