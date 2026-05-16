import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Expense } from '../../core/models/expense.models';
import { ExpenseService } from '../../core/services/expense.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatTableModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly expenses = inject(ExpenseService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly search = new FormControl('', { nonNullable: true });
  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    expenseDate: [new Date(), Validators.required],
    notes: ['']
  });

  displayedColumns = ['title', 'category', 'amount', 'expenseDate', 'actions'];
  items: Expense[] = [];
  editingId?: string;
  total = 0;
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.expenses.list({ page: this.page, pageSize: this.pageSize, search: this.search.value, sortBy: 'expenseDate', sortDirection: 'desc' })
      .subscribe((result) => {
        this.items = result.items;
        this.total = result.totalCount;
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request = { ...value, expenseDate: value.expenseDate.toISOString() };
    const save$ = this.editingId ? this.expenses.update(this.editingId, request) : this.expenses.create(request);
    save$.subscribe(() => {
      this.notifications.success(this.editingId ? 'Expense updated.' : 'Expense created.');
      this.resetForm();
      this.load();
    });
  }

  edit(expense: Expense): void {
    this.editingId = expense.id;
    this.form.patchValue({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      expenseDate: new Date(expense.expenseDate),
      notes: expense.notes ?? ''
    });
  }

  delete(expense: Expense): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete expense', message: `Delete ${expense.title}?` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.expenses.delete(expense.id).subscribe(() => {
        this.notifications.success('Expense deleted.');
        this.load();
      });
    });
  }

  resetForm(): void {
    this.editingId = undefined;
    this.form.reset({ title: '', category: '', amount: 0, expenseDate: new Date(), notes: '' });
  }

  pageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }
}