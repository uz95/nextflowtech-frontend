import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QueryParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/$/, '');

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.params(params) });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  postForm<T>(path: string, body: FormData): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.url(path), body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }

  download(path: string): Observable<Blob> {
    return this.http.get(this.url(path), { responseType: 'blob' });
  }

  publicUrl(path?: string | null): string | null {
    if (!path) {
      return null;
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    if (!/^https?:\/\//i.test(this.baseUrl)) {
      return path;
    }

    return `${new URL(this.baseUrl).origin}/${path.replace(/^\//, '')}`;
  }

  private url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }

  private params(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });
    return httpParams;
  }
}
