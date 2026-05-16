import { Injectable } from '@angular/core';
import type Swal from 'sweetalert2';

type SweetAlert = typeof Swal;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private sweetAlert?: Promise<SweetAlert>;

  success(message: string): void {
    void this.show('success', 'Done', message);
  }

  error(message: string): void {
    void this.show('error', 'Something went wrong', message);
  }

  info(message: string): void {
    void this.show('info', 'Notice', message);
  }

  private async show(icon: 'success' | 'error' | 'info', title: string, message: string): Promise<void> {
    const Swal = await this.getSweetAlert();
    await Swal.fire({
      icon,
      title,
      text: message,
      confirmButtonText: 'OK',
      timer: icon === 'success' ? 2200 : undefined,
      timerProgressBar: icon === 'success',
      customClass: {
        popup: 'app-swal-popup',
        title: 'app-swal-title',
        htmlContainer: 'app-swal-html',
        confirmButton: 'app-swal-confirm'
      }
    });
  }

  private getSweetAlert(): Promise<SweetAlert> {
    this.sweetAlert ??= import('sweetalert2/dist/sweetalert2.esm.all.js').then((module) => module.default);
    return this.sweetAlert;
  }
}
