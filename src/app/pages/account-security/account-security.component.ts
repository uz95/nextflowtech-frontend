import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './account-security.component.html',
  styleUrl: './account-security.component.scss'
})
export class AccountSecurityComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.maxLength(128)]],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    confirmPassword: ['', [Validators.required, Validators.maxLength(128)]]
  }, { validators: AccountSecurityComponent.passwordsMatch });

  changePassword(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.auth.changePassword({
      currentPassword: value.currentPassword,
      newPassword: value.newPassword
    }).subscribe(() => {
      this.notifications.success('Password updated. Sign in again.');
      this.auth.logout(false);
      void this.router.navigateByUrl('/login');
    });
  }

  private static passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword || newPassword === confirmPassword) {
      return null;
    }

    return { passwordMismatch: true };
  }
}
