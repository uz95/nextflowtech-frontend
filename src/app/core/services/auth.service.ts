import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, ChangePasswordRequest, ExternalAuthRequest, ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, RegisterRequest, ResetPasswordRequest } from '../models/auth.models';
import { ApiService } from './api.service';

const ACCESS_TOKEN = 'sbo_access_token';
const REFRESH_TOKEN = 'sbo_refresh_token';
const AUTH_USER = 'sbo_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly userSubject = new BehaviorSubject<AuthResponse | null>(this.readUser());
  readonly user$ = this.userSubject.asObservable();

  get accessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN);
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  get currentUser(): AuthResponse | null {
    return this.userSubject.value;
  }

  get homeUrl(): string {
    return this.currentUser?.role === 'SuperAdmin' ? '/admin/dashboard' : '/dashboard';
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', request).pipe(tap((response) => this.saveSession(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', request).pipe(tap((response) => this.saveSession(response)));
  }

  externalLogin(request: ExternalAuthRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/external', request).pipe(tap((response) => this.saveSession(response)));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.api.post<ForgotPasswordResponse>('auth/forgot-password', request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.api.post<void>('auth/reset-password', request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.api.post<void>('auth/change-password', request);
  }

  refresh(): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/refresh', { refreshToken: this.refreshToken }).pipe(tap((response) => this.saveSession(response)));
  }

  logout(redirect = true): void {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(AUTH_USER);
    this.userSubject.next(null);
    if (redirect) {
      void this.router.navigateByUrl('/login');
    }
  }

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(AUTH_USER, JSON.stringify(response));
    this.userSubject.next(response);
  }

  private readUser(): AuthResponse | null {
    const raw = localStorage.getItem(AUTH_USER);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
