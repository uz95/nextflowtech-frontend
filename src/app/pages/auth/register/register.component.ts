import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';
import { ExternalAuthClientService } from '../../../core/services/external-auth-client.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrl: '../auth.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  readonly externalAuth = inject(ExternalAuthClientService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  private googleButtonRendered = false;

  @ViewChild('googleButton')
  set googleButton(element: ElementRef<HTMLElement> | undefined) {
    if (!element || this.googleButtonRendered) {
      return;
    }

    void this.externalAuth.renderGoogleButton(element.nativeElement, (idToken) => this.createWithExternal('Google', idToken))
      .then(() => {
        this.googleButtonRendered = true;
      })
      .catch((error: Error) => this.notifications.error(error.message));
  }

  hidePassword = true;
  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    businessName: ['', Validators.required],
    currency: ['USD', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.register(this.form.getRawValue()).subscribe(() => void this.router.navigateByUrl('/dashboard'));
  }

  async createWithMicrosoft(): Promise<void> {
    try {
      const result = await this.externalAuth.signInWithMicrosoft();
      this.createWithExternal('Microsoft', result.idToken, result.nonce);
    } catch (error) {
      this.notifications.error(error instanceof Error ? error.message : 'Microsoft sign-up failed.');
    }
  }

  private createWithExternal(provider: 'Google' | 'Microsoft', idToken: string, nonce?: string): void {
    const businessName = this.form.controls.businessName.value.trim();
    const currency = this.form.controls.currency.value.trim().toUpperCase();
    if (!businessName || currency.length !== 3) {
      this.form.controls.businessName.markAsTouched();
      this.form.controls.currency.markAsTouched();
      this.notifications.error('Enter business name and 3-letter currency before external sign-up.');
      return;
    }

    this.auth.externalLogin({ provider, idToken, businessName, currency, nonce }).subscribe(() => void this.router.navigateByUrl('/dashboard'));
  }
}
