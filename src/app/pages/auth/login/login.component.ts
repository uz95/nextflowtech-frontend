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
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: '../auth.scss'
})
export class LoginComponent {
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

    void this.externalAuth.renderGoogleButton(element.nativeElement, (idToken) => this.continueWithExternal('Google', idToken))
      .then(() => {
        this.googleButtonRendered = true;
      })
      .catch((error: Error) => this.notifications.error(error.message));
  }

  hidePassword = true;
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.login(this.form.getRawValue()).subscribe(() => void this.router.navigateByUrl(this.auth.homeUrl));
  }

  async continueWithMicrosoft(): Promise<void> {
    try {
      const result = await this.externalAuth.signInWithMicrosoft();
      this.continueWithExternal('Microsoft', result.idToken, result.nonce);
    } catch (error) {
      this.notifications.error(error instanceof Error ? error.message : 'Microsoft sign-in failed.');
    }
  }

  private continueWithExternal(provider: 'Google' | 'Microsoft', idToken: string, nonce?: string): void {
    this.auth.externalLogin({ provider, idToken, nonce }).subscribe(() => void this.router.navigateByUrl(this.auth.homeUrl));
  }
}
