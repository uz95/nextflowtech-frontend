import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-external-auth-callback',
  standalone: true,
  template: '<section class="auth-page"><p>Completing sign in...</p></section>',
  styleUrl: './auth.scss'
})
export class ExternalAuthCallbackComponent implements OnInit {
  ngOnInit(): void {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    window.opener?.postMessage({
      source: 'simple-business-os-external-auth',
      provider: 'Microsoft',
      idToken: params.get('id_token'),
      state: params.get('state')
    }, window.location.origin);
    window.close();
  }
}
