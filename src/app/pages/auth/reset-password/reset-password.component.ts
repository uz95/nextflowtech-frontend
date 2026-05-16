import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './reset-password.component.html',
  styleUrl: '../auth.scss'
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  hidePassword = true;
  readonly form = this.fb.nonNullable.group({
    email: [this.route.snapshot.queryParamMap.get('email') ?? '', [Validators.required, Validators.email]],
    token: [this.route.snapshot.queryParamMap.get('token') ?? '', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.notifications.error('Passwords do not match.');
      return;
    }

    this.auth.resetPassword({
      email: value.email,
      token: value.token,
      newPassword: value.newPassword
    }).subscribe(() => {
      this.notifications.success('Password updated. Sign in with the new password.');
      void this.router.navigateByUrl('/login');
    });
  }
}
