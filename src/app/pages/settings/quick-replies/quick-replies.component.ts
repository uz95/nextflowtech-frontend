import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize } from 'rxjs';
import { WhatsAppQuickReply } from '../../../core/models/whatsapp.models';
import { NotificationService } from '../../../core/services/notification.service';
import { WhatsAppService } from '../../../core/services/whatsapp.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-quick-replies',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSlideToggleModule],
  templateUrl: './quick-replies.component.html',
  styleUrl: './quick-replies.component.scss'
})
export class QuickRepliesComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly whatsApp = inject(WhatsAppService);

  replies: WhatsAppQuickReply[] = [];
  editing?: WhatsAppQuickReply;
  loading = false;
  saving = false;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.load();
    this.seedExample('Greeting', 'Hi, thanks for contacting us. How can we help today?');
  }

  load(): void {
    this.loading = true;
    this.whatsApp.quickReplies(false).pipe(finalize(() => (this.loading = false))).subscribe((items) => (this.replies = items));
  }

  edit(reply: WhatsAppQuickReply): void {
    this.editing = reply;
    this.form.patchValue({
      title: reply.title,
      message: reply.message,
      isActive: reply.isActive
    });
  }

  cancelEdit(): void {
    this.editing = undefined;
    this.form.reset({ title: '', message: '', isActive: true });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const request = this.form.getRawValue();
    const save$ = this.editing
      ? this.whatsApp.updateQuickReply(this.editing.id, request)
      : this.whatsApp.createQuickReply(request);

    save$.pipe(finalize(() => (this.saving = false))).subscribe(() => {
      this.notifications.success(this.editing ? 'Quick reply updated.' : 'Quick reply created.');
      this.cancelEdit();
      this.load();
    });
  }

  delete(reply: WhatsAppQuickReply): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete quick reply', message: `Delete "${reply.title}"?` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.whatsApp.deleteQuickReply(reply.id).subscribe(() => {
        this.notifications.success('Quick reply deleted.');
        this.load();
      });
    });
  }

  useExample(title: string, message: string): void {
    this.form.patchValue({ title, message, isActive: true });
  }

  private seedExample(title: string, message: string): void {
    if (!this.form.controls.title.value && !this.form.controls.message.value) {
      this.form.patchValue({ title, message });
    }
  }
}
