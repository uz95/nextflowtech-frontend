export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  currency: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string | null;
}

export interface ExternalAuthConfigResponse {
  googleClientId: string;
  microsoftClientId: string;
  microsoftTenantId: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type ExternalAuthProvider = 'Google' | 'Microsoft';

export interface ExternalAuthRequest {
  provider: ExternalAuthProvider;
  idToken: string;
  businessName?: string | null;
  currency?: string;
  nonce?: string | null;
}

export interface AuthResponse {
  userId: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
