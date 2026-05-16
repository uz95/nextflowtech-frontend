import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExternalAuthConfigResponse, ExternalAuthProvider } from '../models/auth.models';
import { ApiService } from './api.service';

interface ExternalAuthPopupMessage {
  source?: string;
  provider?: ExternalAuthProvider;
  idToken?: string;
  state?: string;
}

interface MicrosoftTokenResult {
  idToken: string;
  nonce: string;
}

interface GoogleAccounts {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

@Injectable({ providedIn: 'root' })
export class ExternalAuthClientService {
  private readonly api = inject(ApiService);
  private readonly config = signal<ExternalAuthConfigResponse>({
    googleClientId: environment.externalAuth.googleClientId,
    microsoftClientId: environment.externalAuth.microsoftClientId,
    microsoftTenantId: environment.externalAuth.microsoftTenantId
  });
  private readonly configLoadedSignal = signal(false);
  private googleScriptPromise?: Promise<void>;

  constructor() {
    void this.loadConfig();
  }

  get configLoaded(): boolean {
    return this.configLoadedSignal();
  }

  get googleConfigured(): boolean {
    return !!this.config().googleClientId;
  }

  get microsoftConfigured(): boolean {
    return !!this.config().microsoftClientId;
  }

  get anyProviderConfigured(): boolean {
    return this.googleConfigured || this.microsoftConfigured;
  }

  async renderGoogleButton(element: HTMLElement, callback: (idToken: string) => void): Promise<void> {
    const clientId = this.config().googleClientId;
    if (!clientId) {
      return;
    }

    element.innerHTML = '';
    await this.loadGoogleScript();
    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          callback(response.credential);
        }
      }
    });
    window.google?.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      width: 320,
      text: 'continue_with'
    });
  }

  signInWithMicrosoft(): Promise<MicrosoftTokenResult> {
    if (!this.microsoftConfigured) {
      return Promise.reject(new Error('Microsoft sign-in is not configured.'));
    }

    const config = this.config();
    const state = this.randomValue();
    const nonce = this.randomValue();
    const redirectUri = `${window.location.origin}/auth/external-callback`;
    const tenantId = config.microsoftTenantId || 'common';
    const params = new URLSearchParams({
      client_id: config.microsoftClientId,
      response_type: 'id_token',
      redirect_uri: redirectUri,
      response_mode: 'fragment',
      scope: 'openid profile email',
      nonce,
      state,
      prompt: 'select_account'
    });
    const url = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/authorize?${params.toString()}`;
    const popup = window.open(url, 'simple-business-os-microsoft-login', 'width=520,height=640');
    if (!popup) {
      return Promise.reject(new Error('Pop-up was blocked.'));
    }

    return new Promise((resolve, reject) => {
      let timeout = 0;
      let interval = 0;
      const cleanup = () => {
        window.clearTimeout(timeout);
        window.clearInterval(interval);
        window.removeEventListener('message', listener);
        popup.close();
      };
      const listener = (event: MessageEvent<ExternalAuthPopupMessage>) => {
        if (event.origin !== window.location.origin) {
          return;
        }

        const data = event.data;
        if (data?.source !== 'simple-business-os-external-auth' || data.provider !== 'Microsoft') {
          return;
        }

        if (data.state !== state || !data.idToken) {
          cleanup();
          reject(new Error('Microsoft sign-in response was invalid.'));
          return;
        }

        cleanup();
        resolve({ idToken: data.idToken, nonce });
      };

      timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('Microsoft sign-in timed out.'));
      }, 120_000);
      interval = window.setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error('Microsoft sign-in was cancelled.'));
        }
      }, 500);

      window.addEventListener('message', listener);
    });
  }

  private async loadConfig(): Promise<void> {
    try {
      const response = await firstValueFrom(this.api.get<ExternalAuthConfigResponse>('auth/external-config'));
      this.config.set({
        googleClientId: response.googleClientId ?? '',
        microsoftClientId: response.microsoftClientId ?? '',
        microsoftTenantId: response.microsoftTenantId || 'common'
      });
    } catch {
      this.config.set({
        googleClientId: environment.externalAuth.googleClientId,
        microsoftClientId: environment.externalAuth.microsoftClientId,
        microsoftTenantId: environment.externalAuth.microsoftTenantId || 'common'
      });
    } finally {
      this.configLoadedSignal.set(true);
    }
  }

  private loadGoogleScript(): Promise<void> {
    if (this.googleScriptPromise) {
      return this.googleScriptPromise;
    }

    this.googleScriptPromise = new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load Google sign-in.'));
      document.head.appendChild(script);
    });

    return this.googleScriptPromise;
  }

  private randomValue(): string {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
