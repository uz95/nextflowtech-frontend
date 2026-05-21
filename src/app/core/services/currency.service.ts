import { Injectable, inject, signal } from '@angular/core';
import { BusinessService } from './business.service';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly business = inject(BusinessService);
  private readonly code = signal('USD');

  readonly currencyCode = this.code.asReadonly();

  constructor() {
    this.business.profile$.subscribe((profile) => {
      const currency = profile?.currency?.trim().toUpperCase();
      if (currency) {
        this.code.set(currency);
      }
    });
  }
}
