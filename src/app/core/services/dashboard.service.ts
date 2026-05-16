import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Dashboard } from '../models/dashboard.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  get(): Observable<Dashboard> {
    return this.api.get<Dashboard>('dashboard');
  }
}