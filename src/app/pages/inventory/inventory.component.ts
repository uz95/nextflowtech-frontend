import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { InventoryItem } from '../../core/models/inventory.models';
import { InventoryService } from '../../core/services/inventory.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatTableModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly search = new FormControl('', { nonNullable: true });
  readonly lowStockOnly = new FormControl(false, { nonNullable: true });
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    category: [''],
    description: [''],
    quantityOnHand: [0, [Validators.required, Validators.min(0)]],
    reorderLevel: [0, [Validators.required, Validators.min(0)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  displayedColumns = ['name', 'sku', 'category', 'quantityOnHand', 'unitPrice', 'status', 'actions'];
  items: InventoryItem[] = [];
  editingId?: string;
  total = 0;
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.inventory.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search.value,
      lowStockOnly: this.lowStockOnly.value || undefined,
      sortBy: 'name'
    }).subscribe((result) => {
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
    const request = {
      name: value.name,
      sku: value.sku,
      category: value.category || null,
      description: value.description || null,
      quantityOnHand: Number(value.quantityOnHand),
      reorderLevel: Number(value.reorderLevel),
      unitCost: Number(value.unitCost),
      unitPrice: Number(value.unitPrice),
      isActive: value.isActive
    };
    const save$ = this.editingId ? this.inventory.update(this.editingId, request) : this.inventory.create(request);

    save$.subscribe(() => {
      this.notifications.success(this.editingId ? 'Inventory item updated.' : 'Inventory item created.');
      this.resetForm();
      this.load();
    });
  }

  edit(item: InventoryItem): void {
    this.editingId = item.id;
    this.form.patchValue({
      name: item.name,
      sku: item.sku,
      category: item.category ?? '',
      description: item.description ?? '',
      quantityOnHand: item.quantityOnHand,
      reorderLevel: item.reorderLevel,
      unitCost: item.unitCost,
      unitPrice: item.unitPrice,
      isActive: item.isActive
    });
  }

  delete(item: InventoryItem): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete inventory item', message: `Delete ${item.name}? Existing invoices will keep their line item text.` }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.inventory.delete(item.id).subscribe(() => {
        this.notifications.success('Inventory item deleted.');
        this.load();
      });
    });
  }

  resetForm(): void {
    this.editingId = undefined;
    this.form.reset({
      name: '',
      sku: '',
      category: '',
      description: '',
      quantityOnHand: 0,
      reorderLevel: 0,
      unitCost: 0,
      unitPrice: 0,
      isActive: true
    });
  }

  pageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.load();
  }
}
