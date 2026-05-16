import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../auth.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  resetToken?: string | null;
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.forgotPassword(this.form.getRawValue()).subscribe((response) => {
      this.resetToken = response.resetToken;
      this.notifications.success(response.message);
    });
  }

  continueToReset(): void {
    void this.router.navigate(['/reset-password'], {
      queryParams: {
        email: this.form.controls.email.value,
        token: this.resetToken
      }
    });
  }
}
